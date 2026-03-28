import React, { useState, useCallback, useMemo } from 'react';

// Types
interface ComparisonResult {
  id: string;
  category: string;
  element: string;
  file1Value: string;
  file2Value: string;
  status: 'ADDED' | 'REMOVED' | 'MODIFIED' | 'UNCHANGED' | 'INFO';
  notes?: string;
}

interface SummaryStats {
  added: number;
  removed: number;
  modified: number;
  sections: number;
}

// XML Helper functions
function getLocalName(node: Element): string {
  const fullName = node.nodeName;
  const colonPos = fullName.indexOf(':');
  return colonPos > 0 ? fullName.substring(colonPos + 1) : fullName;
}

function getAttr(node: Element, attrName: string): string {
  return node.getAttribute(attrName) || '';
}

function getChildByName(parent: Element, childName: string): Element | null {
  for (const child of parent.children) {
    if (getLocalName(child) === childName) return child;
  }
  return null;
}

function buildChildDict(parent: Element, childName: string, keyAttr: string): Map<string, Element> {
  const dict = new Map<string, Element>();
  for (const child of parent.children) {
    if (getLocalName(child) === childName) {
      const key = getAttr(child, keyAttr);
      if (key && !dict.has(key)) dict.set(key, child);
    }
  }
  return dict;
}

function buildDescendantDict(parent: Element, descName: string, keyAttr: string): Map<string, Element> {
  const dict = new Map<string, Element>();
  const walker = parent.ownerDocument?.createTreeWalker(parent, NodeFilter.SHOW_ELEMENT);
  if (!walker) return dict;

  let node: Node | null = walker.currentNode;
  while (node) {
    const el = node as Element;
    if (getLocalName(el) === descName) {
      const key = getAttr(el, keyAttr);
      if (key && !dict.has(key)) dict.set(key, el);
    }
    node = walker.nextNode();
  }
  return dict;
}

function buildPDict(addrNode: Element): Map<string, string> {
  const dict = new Map<string, string>();
  for (const child of addrNode.children) {
    if (getLocalName(child) === 'P') {
      const pType = getAttr(child, 'type');
      if (pType) dict.set(pType, child.textContent || '');
    }
  }
  return dict;
}

function countChildren(parent: Element, childName?: string): number {
  let count = 0;
  for (const child of parent.children) {
    if (!childName || getLocalName(child) === childName) count++;
  }
  return count;
}

function getFCDASignature(fcda: Element): string {
  return [
    getAttr(fcda, 'ldInst'),
    getAttr(fcda, 'prefix'),
    getAttr(fcda, 'lnClass'),
    getAttr(fcda, 'lnInst'),
    getAttr(fcda, 'doName'),
    getAttr(fcda, 'daName'),
    getAttr(fcda, 'fc'),
  ].join(',');
}

function buildLNodeDict(ldNode: Element): Map<string, Element> {
  const dict = new Map<string, Element>();
  for (const child of ldNode.children) {
    const lname = getLocalName(child);
    if (lname === 'LN' || lname === 'LN0') {
      const key = getAttr(child, 'prefix') + getAttr(child, 'lnClass') + getAttr(child, 'inst') || 'LN0';
      if (!dict.has(key)) dict.set(key, child);
    }
  }
  return dict;
}

// Comparison Engine
class ComparisonEngine {
  results: ComparisonResult[] = [];
  stats: SummaryStats = { added: 0, removed: 0, modified: 0, sections: 0 };
  private idCounter = 0;

  private addResult(category: string, element: string, file1Value: string, file2Value: string, status: ComparisonResult['status'], notes?: string) {
    this.results.push({
      id: `result-${++this.idCounter}`,
      category,
      element,
      file1Value,
      file2Value,
      status,
      notes,
    });
    if (status === 'ADDED') this.stats.added++;
    if (status === 'REMOVED') this.stats.removed++;
    if (status === 'MODIFIED') this.stats.modified++;
  }

  private writeSectionHeader(sectionKey: string, sectionDesc: string) {
    this.addResult(sectionKey, sectionDesc, '', '', 'INFO');
    this.stats.sections++;
  }

  compare(doc1: Document, doc2: Document) {
    const root1 = doc1.documentElement;
    const root2 = doc2.documentElement;

    if (!root1 || getLocalName(root1) !== 'SCL') {
      throw new Error('File 1 has no <SCL> root element - is it a valid SCL file?');
    }
    if (!root2 || getLocalName(root2) !== 'SCL') {
      throw new Error('File 2 has no <SCL> root element - is it a valid SCL file?');
    }

    this.compareHeader(root1, root2);
    this.compareIEDs(root1, root2);
    this.compareCommunication(root1, root2);
    this.compareDataTypeTemplates(root1, root2);
  }

  private compareHeader(root1: Element, root2: Element) {
    this.writeSectionHeader('HEADER', 'SCL File Header Attributes');

    const hdr1 = getChildByName(root1, 'Header');
    const hdr2 = getChildByName(root2, 'Header');

    if (!hdr1 && !hdr2) {
      this.addResult('Header', 'No <Header> element in either file', '', '', 'INFO');
      return;
    }
    if (!hdr1) {
      this.addResult('Header', '<Header>', '(absent)', '(present)', 'ADDED');
      return;
    }
    if (!hdr2) {
      this.addResult('Header', '<Header>', '(present)', '(absent)', 'REMOVED');
      return;
    }

    const attrs = ['id', 'version', 'revision', 'toolID', 'nameStructure'];
    for (const a of attrs) {
      const v1 = getAttr(hdr1, a);
      const v2 = getAttr(hdr2, a);
      if (v1 !== v2) {
        this.addResult('Header', `Header/@${a}`, v1, v2, 'MODIFIED');
      }
    }
  }

  private compareIEDs(root1: Element, root2: Element) {
    this.writeSectionHeader('IEDs', 'Intelligent Electronic Devices');

    const ieds1 = buildChildDict(root1, 'IED', 'name');
    const ieds2 = buildChildDict(root2, 'IED', 'name');

    for (const [key, iedNode] of ieds1) {
      if (!ieds2.has(key)) {
        this.addResult('IED', `IED[@name='${key}']`, '(present)', '(removed)', 'REMOVED');
        const attrs = ['manufacturer', 'type', 'desc', 'configVersion'];
        for (const a of attrs) {
          const v = getAttr(iedNode, a);
          if (v) this.addResult('IED', `  @${a}`, v, '', 'REMOVED');
        }
      }
    }

    for (const [key, iedNode] of ieds2) {
      if (!ieds1.has(key)) {
        this.addResult('IED', `IED[@name='${key}']`, '(new)', '(present)', 'ADDED');
        const attrs = ['manufacturer', 'type', 'desc', 'configVersion'];
        for (const a of attrs) {
          const v = getAttr(iedNode, a);
          if (v) this.addResult('IED', `  @${a}`, '', v, 'ADDED');
        }
      }
    }

    for (const [key, ied1] of ieds1) {
      if (ieds2.has(key)) {
        this.compareIEDDetail(key, ied1, ieds2.get(key)!);
      }
    }
  }

  private compareIEDDetail(iedName: string, ied1: Element, ied2: Element) {
    const prefix = `IED[${iedName}]`;

    const attrs = ['manufacturer', 'type', 'desc', 'configVersion', 'originalSclVersion', 'originalSclRevision'];
    for (const a of attrs) {
      const v1 = getAttr(ied1, a);
      const v2 = getAttr(ied2, a);
      if (v1 !== v2) {
        this.addResult('IED', `${prefix}/@${a}`, v1, v2, 'MODIFIED');
      }
    }

    this.compareLDevices(prefix, ied1, ied2);
    this.compareDatasets(prefix, ied1, ied2);
    this.compareControlBlocks(prefix, ied1, ied2, 'ReportControl');
    this.compareControlBlocks(prefix, ied1, ied2, 'GSEControl');
    this.compareControlBlocks(prefix, ied1, ied2, 'SampledValueControl');
    this.compareControlBlocks(prefix, ied1, ied2, 'LogControl');
  }

  private compareLDevices(prefix: string, ied1: Element, ied2: Element) {
    const lds1 = buildDescendantDict(ied1, 'LDevice', 'inst');
    const lds2 = buildDescendantDict(ied2, 'LDevice', 'inst');

    for (const key of lds1.keys()) {
      if (!lds2.has(key)) {
        this.addResult('LDevice', `${prefix}/LDevice[@inst='${key}']`, '(present)', '(removed)', 'REMOVED');
      }
    }

    for (const key of lds2.keys()) {
      if (!lds1.has(key)) {
        this.addResult('LDevice', `${prefix}/LDevice[@inst='${key}']`, '(new)', '(present)', 'ADDED');
      }
    }

    for (const [key, ld1] of lds1) {
      if (lds2.has(key)) {
        const ld2 = lds2.get(key)!;
        const v1 = getAttr(ld1, 'desc');
        const v2 = getAttr(ld2, 'desc');
        if (v1 !== v2) {
          this.addResult('LDevice', `${prefix}/LDevice[@inst='${key}']/@desc`, v1, v2, 'MODIFIED');
        }
        this.compareLNodeTypes(`${prefix}/LDevice[@inst='${key}']`, ld1, ld2);
      }
    }
  }

  private compareLNodeTypes(path: string, ld1: Element, ld2: Element) {
    const lns1 = buildLNodeDict(ld1);
    const lns2 = buildLNodeDict(ld2);

    for (const key of lns1.keys()) {
      if (!lns2.has(key)) {
        this.addResult('LNode', `${path}/LN[${key}]`, '(present)', '(removed)', 'REMOVED');
      }
    }

    for (const key of lns2.keys()) {
      if (!lns1.has(key)) {
        this.addResult('LNode', `${path}/LN[${key}]`, '(new)', '(present)', 'ADDED');
      }
    }

    for (const [key, ln1] of lns1) {
      if (lns2.has(key)) {
        const ln2 = lns2.get(key)!;
        const attrs = ['lnType', 'desc'];
        for (const a of attrs) {
          const v1 = getAttr(ln1, a);
          const v2 = getAttr(ln2, a);
          if (v1 !== v2) {
            this.addResult('LNode', `${path}/LN[${key}]/@${a}`, v1, v2, 'MODIFIED');
          }
        }
      }
    }
  }

  private compareDatasets(prefix: string, ied1: Element, ied2: Element) {
    const ds1 = buildDescendantDict(ied1, 'DataSet', 'name');
    const ds2 = buildDescendantDict(ied2, 'DataSet', 'name');

    for (const key of ds1.keys()) {
      if (!ds2.has(key)) {
        this.addResult('DataSet', `${prefix}/DataSet[@name='${key}']`, '(present)', '(removed)', 'REMOVED');
      }
    }

    for (const key of ds2.keys()) {
      if (!ds1.has(key)) {
        this.addResult('DataSet', `${prefix}/DataSet[@name='${key}']`, '(new)', '(present)', 'ADDED');
      }
    }

    for (const [key, d1] of ds1) {
      if (ds2.has(key)) {
        const d2 = ds2.get(key)!;
        const cnt1 = countChildren(d1, 'FCDA');
        const cnt2 = countChildren(d2, 'FCDA');
        if (cnt1 !== cnt2) {
          this.addResult('DataSet', `${prefix}/DataSet[@name='${key}'] member count`, `${cnt1} FCDAs`, `${cnt2} FCDAs`, 'MODIFIED', 'Dataset membership changed');
        }
        this.compareFCDAs(`${prefix}/DataSet[@name='${key}']`, d1, d2);
      }
    }
  }

  private compareFCDAs(path: string, ds1: Element, ds2: Element) {
    const set1 = new Set<string>();
    const set2 = new Set<string>();

    for (const child of ds1.children) {
      if (getLocalName(child) === 'FCDA') {
        set1.add(getFCDASignature(child));
      }
    }

    for (const child of ds2.children) {
      if (getLocalName(child) === 'FCDA') {
        set2.add(getFCDASignature(child));
      }
    }

    for (const sig of set1) {
      if (!set2.has(sig)) {
        this.addResult('FCDA', `${path}/FCDA`, sig, '(removed)', 'REMOVED');
      }
    }

    for (const sig of set2) {
      if (!set1.has(sig)) {
        this.addResult('FCDA', `${path}/FCDA`, '(new)', sig, 'ADDED');
      }
    }
  }

  private compareControlBlocks(prefix: string, ied1: Element, ied2: Element, cbType: string) {
    const cb1 = buildDescendantDict(ied1, cbType, 'name');
    const cb2 = buildDescendantDict(ied2, cbType, 'name');

    for (const key of cb1.keys()) {
      if (!cb2.has(key)) {
        this.addResult(cbType, `${prefix}/${cbType}[@name='${key}']`, '(present)', '(removed)', 'REMOVED');
      }
    }

    for (const key of cb2.keys()) {
      if (!cb1.has(key)) {
        this.addResult(cbType, `${prefix}/${cbType}[@name='${key}']`, '(new)', '(present)', 'ADDED');
      }
    }

    let attrStr: string;
    switch (cbType) {
      case 'ReportControl':
        attrStr = 'desc,datSet,rptID,confRev,buffered,bufTime,intgPd';
        break;
      case 'GSEControl':
        attrStr = 'desc,datSet,appID,confRev,type';
        break;
      case 'SampledValueControl':
        attrStr = 'desc,datSet,smvID,multicast,smpRate,nofASDU,confRev';
        break;
      case 'LogControl':
        attrStr = 'desc,datSet,logName,intgPd,logEna,reasonCode';
        break;
      default:
        attrStr = 'desc,datSet,confRev';
    }

    for (const [key, c1] of cb1) {
      if (cb2.has(key)) {
        const c2 = cb2.get(key)!;
        const attrs = attrStr.split(',');
        for (const a of attrs) {
          const v1 = getAttr(c1, a);
          const v2 = getAttr(c2, a);
          if (v1 !== v2) {
            this.addResult(cbType, `${prefix}/${cbType}[@name='${key}']/@${a}`, v1, v2, 'MODIFIED');
          }
        }
      }
    }
  }

  private compareCommunication(root1: Element, root2: Element) {
    this.writeSectionHeader('COMMUNICATION', 'Communication Network Configuration');

    const comm1 = getChildByName(root1, 'Communication');
    const comm2 = getChildByName(root2, 'Communication');

    if (!comm1 && !comm2) {
      this.addResult('Communication', 'No <Communication> section in either file', '', '', 'INFO');
      return;
    }
    if (!comm1) {
      this.addResult('Communication', '<Communication>', '(absent)', '(present)', 'ADDED');
      return;
    }
    if (!comm2) {
      this.addResult('Communication', '<Communication>', '(present)', '(absent)', 'REMOVED');
      return;
    }

    this.compareSubNetworks(comm1, comm2);
  }

  private compareSubNetworks(comm1: Element, comm2: Element) {
    const sn1 = buildChildDict(comm1, 'SubNetwork', 'name');
    const sn2 = buildChildDict(comm2, 'SubNetwork', 'name');

    for (const key of sn1.keys()) {
      if (!sn2.has(key)) {
        this.addResult('SubNetwork', `SubNetwork[@name='${key}']`, '(present)', '(removed)', 'REMOVED');
      }
    }

    for (const key of sn2.keys()) {
      if (!sn1.has(key)) {
        this.addResult('SubNetwork', `SubNetwork[@name='${key}']`, '(new)', '(present)', 'ADDED');
      }
    }

    for (const [key, s1] of sn1) {
      if (sn2.has(key)) {
        const s2 = sn2.get(key)!;
        const v1 = getAttr(s1, 'type');
        const v2 = getAttr(s2, 'type');
        if (v1 !== v2) {
          this.addResult('SubNetwork', `SubNetwork[@name='${key}']/@type`, v1, v2, 'MODIFIED');
        }
        this.compareConnectedAPs(key, s1, s2);
      }
    }
  }

  private compareConnectedAPs(snName: string, sn1: Element, sn2: Element) {
    const cap1 = new Map<string, Element>();
    const cap2 = new Map<string, Element>();

    for (const child of sn1.children) {
      if (getLocalName(child) === 'ConnectedAP') {
        const capKey = `${getAttr(child, 'iedName')}/${getAttr(child, 'apName')}`;
        if (!cap1.has(capKey)) cap1.set(capKey, child);
      }
    }

    for (const child of sn2.children) {
      if (getLocalName(child) === 'ConnectedAP') {
        const capKey = `${getAttr(child, 'iedName')}/${getAttr(child, 'apName')}`;
        if (!cap2.has(capKey)) cap2.set(capKey, child);
      }
    }

    for (const key of cap1.keys()) {
      if (!cap2.has(key)) {
        this.addResult('ConnectedAP', `${snName}/ConnectedAP[${key}]`, '(present)', '(removed)', 'REMOVED');
      }
    }

    for (const key of cap2.keys()) {
      if (!cap1.has(key)) {
        this.addResult('ConnectedAP', `${snName}/ConnectedAP[${key}]`, '(new)', '(present)', 'ADDED');
      }
    }

    for (const [key, c1] of cap1) {
      if (cap2.has(key)) {
        this.compareConnectedAPDetail(`${snName}/ConnectedAP[${key}]`, c1, cap2.get(key)!);
      }
    }
  }

  private compareConnectedAPDetail(path: string, cap1: Element, cap2: Element) {
    const addr1 = getChildByName(cap1, 'Address');
    const addr2 = getChildByName(cap2, 'Address');

    if (addr1 && addr2) {
      this.compareAddressPElements(`${path}/Address`, addr1, addr2);
    } else if (!addr1 && addr2) {
      this.addResult('Address', `${path}/Address`, '(absent)', '(present)', 'ADDED');
    } else if (addr1 && !addr2) {
      this.addResult('Address', `${path}/Address`, '(present)', '(absent)', 'REMOVED');
    }

    this.compareGSESMVBlocks(path, cap1, cap2, 'GSE');
    this.compareGSESMVBlocks(path, cap1, cap2, 'SMV');
  }

  private compareAddressPElements(path: string, addr1: Element, addr2: Element) {
    const p1 = buildPDict(addr1);
    const p2 = buildPDict(addr2);

    for (const [key, pv1] of p1) {
      const pv2 = p2.get(key) || '';
      if (pv1 !== pv2) {
        this.addResult('Address P', `${path}/P[@type='${key}']`, pv1, pv2, 'MODIFIED');
      }
    }

    for (const key of p2.keys()) {
      if (!p1.has(key)) {
        this.addResult('Address P', `${path}/P[@type='${key}']`, '(absent)', p2.get(key)!, 'ADDED');
      }
    }
  }

  private compareGSESMVBlocks(path: string, cap1: Element, cap2: Element, elemType: string) {
    const elems1 = new Map<string, Element>();
    const elems2 = new Map<string, Element>();

    for (const child of cap1.children) {
      if (getLocalName(child) === elemType) {
        const eKey = `${getAttr(child, 'ldInst')}/${getAttr(child, 'cbName')}`;
        if (!elems1.has(eKey)) elems1.set(eKey, child);
      }
    }

    for (const child of cap2.children) {
      if (getLocalName(child) === elemType) {
        const eKey = `${getAttr(child, 'ldInst')}/${getAttr(child, 'cbName')}`;
        if (!elems2.has(eKey)) elems2.set(eKey, child);
      }
    }

    for (const key of elems1.keys()) {
      if (!elems2.has(key)) {
        this.addResult(elemType, `${path}/${elemType}[${key}]`, '(present)', '(removed)', 'REMOVED');
      }
    }

    for (const key of elems2.keys()) {
      if (!elems1.has(key)) {
        this.addResult(elemType, `${path}/${elemType}[${key}]`, '(new)', '(present)', 'ADDED');
      }
    }

    for (const [key, e1] of elems1) {
      if (elems2.has(key)) {
        const e2 = elems2.get(key)!;
        const addr1 = getChildByName(e1, 'Address');
        const addr2 = getChildByName(e2, 'Address');
        if (addr1 && addr2) {
          this.compareAddressPElements(`${path}/${elemType}[${key}]/Address`, addr1, addr2);
        }
      }
    }
  }

  private compareDataTypeTemplates(root1: Element, root2: Element) {
    this.writeSectionHeader('DATA TYPES', 'DataTypeTemplates (LNodeType / DOType / DAType / EnumType)');

    const dtt1 = getChildByName(root1, 'DataTypeTemplates');
    const dtt2 = getChildByName(root2, 'DataTypeTemplates');

    if (!dtt1 && !dtt2) {
      this.addResult('DataTypeTemplates', 'No <DataTypeTemplates> section in either file', '', '', 'INFO');
      return;
    }
    if (!dtt1) {
      this.addResult('DataTypeTemplates', '<DataTypeTemplates>', '(absent)', '(present)', 'ADDED');
      return;
    }
    if (!dtt2) {
      this.addResult('DataTypeTemplates', '<DataTypeTemplates>', '(present)', '(absent)', 'REMOVED');
      return;
    }

    this.compareTemplateType(dtt1, dtt2, 'LNodeType', 'lnClass');
    this.compareTemplateType(dtt1, dtt2, 'DOType', 'cdc');
    this.compareTemplateType(dtt1, dtt2, 'DAType', '');
    this.compareTemplateType(dtt1, dtt2, 'EnumType', '');
  }

  private compareTemplateType(dtt1: Element, dtt2: Element, typeName: string, extraAttr: string) {
    const t1 = buildChildDict(dtt1, typeName, 'id');
    const t2 = buildChildDict(dtt2, typeName, 'id');

    for (const key of t1.keys()) {
      if (!t2.has(key)) {
        this.addResult(typeName, `${typeName}[@id='${key}']`, '(present)', '(removed)', 'REMOVED');
      }
    }

    for (const key of t2.keys()) {
      if (!t1.has(key)) {
        let label = `${typeName}[@id='${key}']`;
        if (extraAttr) {
          label += ` (${extraAttr}=${getAttr(t2.get(key)!, extraAttr)})`;
        }
        this.addResult(typeName, label, '(new)', '(present)', 'ADDED');
      }
    }

    for (const [key, type1] of t1) {
      if (t2.has(key)) {
        const type2 = t2.get(key)!;
        const cnt1 = countChildren(type1);
        const cnt2 = countChildren(type2);
        if (cnt1 !== cnt2) {
          this.addResult(typeName, `${typeName}[@id='${key}'] child count`, String(cnt1), String(cnt2), 'MODIFIED', 'DO/DA/BDA member count differs');
        }
      }
    }
  }
}

// UI Components
const StatusBadge: React.FC<{ status: ComparisonResult['status'] }> = ({ status }) => {
  const styles = {
    ADDED: 'bg-green-100 text-green-800 border-green-300',
    REMOVED: 'bg-red-100 text-red-800 border-red-300',
    MODIFIED: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    UNCHANGED: 'bg-gray-100 text-gray-600 border-gray-300',
    INFO: 'bg-blue-100 text-blue-800 border-blue-300',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status]}`}>
      {status}
    </span>
  );
};

const ResultRow: React.FC<{ result: ComparisonResult }> = ({ result }) => {
  const rowStyles = {
    ADDED: 'bg-green-50/50',
    REMOVED: 'bg-red-50/50',
    MODIFIED: 'bg-yellow-50/50',
    UNCHANGED: 'bg-gray-50',
    INFO: 'bg-blue-50',
  };

  const isSectionHeader = result.status === 'INFO' && !result.file1Value && !result.file2Value;

  if (isSectionHeader) {
    return (
      <tr className="bg-slate-700 text-white">
        <td colSpan={5} className="px-4 py-2 font-semibold text-sm">
          <span className="text-slate-200 mr-2">{result.category}</span>
          <span className="text-slate-300 font-normal">— {result.element}</span>
        </td>
      </tr>
    );
  }

  return (
    <tr className={`${rowStyles[result.status]} border-b border-gray-200 hover:bg-opacity-80 transition-colors`}>
      <td className="px-4 py-2 text-sm font-medium text-gray-900 whitespace-nowrap">{result.category}</td>
      <td className="px-4 py-2 text-sm text-gray-700 font-mono text-xs max-w-xs truncate" title={result.element}>
        {result.element}
      </td>
      <td className={`px-4 py-2 text-sm text-gray-600 max-w-xs truncate ${result.status === 'REMOVED' ? 'line-through' : ''}`} title={result.file1Value}>
        {result.file1Value}
      </td>
      <td className="px-4 py-2 text-sm text-gray-600 max-w-xs truncate" title={result.file2Value}>
        {result.file2Value}
      </td>
      <td className="px-4 py-2 whitespace-nowrap">
        <StatusBadge status={result.status} />
      </td>
    </tr>
  );
};

// Main Component
const IEC61850FileComparison: React.FC = () => {
  const [file1, setFile1] = useState<File | null>(null);
  const [file2, setFile2] = useState<File | null>(null);
  const [results, setResults] = useState<ComparisonResult[]>([]);
  const [stats, setStats] = useState<SummaryStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile1Change = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFile1(file);
    setError(null);
  }, []);

  const handleFile2Change = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFile2(file);
    setError(null);
  }, []);

  const parseXML = async (file: File): Promise<Document> => {
    const text = await file.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, 'application/xml');
    const parseError = doc.querySelector('parsererror');
    if (parseError) {
      throw new Error(`Failed to parse ${file.name}: XML parsing error`);
    }
    return doc;
  };

  const runComparison = useCallback(async () => {
    if (!file1 || !file2) {
      setError('Please select both files');
      return;
    }

    if (file1.name === file2.name) {
      setError('Please select two different files');
      return;
    }

    setLoading(true);
    setError(null);
    setResults([]);
    setStats(null);

    try {
      const [doc1, doc2] = await Promise.all([parseXML(file1), parseXML(file2)]);
      const engine = new ComparisonEngine();
      engine.compare(doc1, doc2);
      setResults(engine.results);
      setStats(engine.stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during comparison');
    } finally {
      setLoading(false);
    }
  }, [file1, file2]);

  const filteredResults = useMemo(() => {
    return results.filter(r => r.status !== 'UNCHANGED');
  }, [results]);

  const totalChanges = (stats?.added || 0) + (stats?.removed || 0) + (stats?.modified || 0);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Select SCL Files to Compare</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Base File (File 1) <span className="text-red-500">*</span>
            </label>
            <input
              type="file"
              accept=".cid,.scd,.icd,.ssd,.xml"
              onChange={handleFile1Change}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {file1 && <p className="text-sm text-gray-600">Selected: {file1.name}</p>}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Modified File (File 2) <span className="text-red-500">*</span>
            </label>
            <input
              type="file"
              accept=".cid,.scd,.icd,.ssd,.xml"
              onChange={handleFile2Change}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
            />
            {file2 && <p className="text-sm text-gray-600">Selected: {file2.name}</p>}
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="mt-6">
          <button
            onClick={runComparison}
            disabled={loading || !file1 || !file2}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Comparing...' : 'Compare Files'}
          </button>
        </div>
      </div>

      {stats && (
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-sm font-medium text-gray-700">
              {stats.sections} sections compared
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
              {stats.added} added
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
              {stats.removed} removed
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
              {stats.modified} modified
            </span>
            {totalChanges === 0 && (
              <span className="text-sm font-medium text-green-600">
                No differences found - files are identical
              </span>
            )}
          </div>
        </div>
      )}

      {filteredResults.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Section</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Element</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">File 1 Value</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">File 2 Value</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredResults.map((result) => (
                  <ResultRow key={result.id} result={result} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default IEC61850FileComparison;
