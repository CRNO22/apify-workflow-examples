import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const headers={
 oliveyoung:['recordKey','observedAt','productId','name','brand','categoryId','rank','previousRank','rankChange','price','previousPrice','priceChange','priceChangePercent','currency','isSoldOut','comparisonStatus','isNewEntry','productUrl','runId'],
 jobs:['recordKey','observedAt','source','id','board','title','location','departments','changeType','changedFields','url','runId']
};
const normalizeBoardsCode=String.raw`
c.boards=[...new Set(c.boardUrls.split(/\r?\n/).map(x=>x.trim()).filter(Boolean).map(value=>{
 if(/^(greenhouse|lever|lever-eu|ashby):[A-Za-z0-9_-]+$/.test(value))return value;
 const match=/^https:\/\/(boards\.greenhouse\.io|job-boards\.greenhouse\.io|jobs\.lever\.co|jobs\.eu\.lever\.co|jobs\.ashbyhq\.com)\/([A-Za-z0-9_-]+)(?:\/[A-Za-z0-9_-]+)*\/?(?:[?#][^\\]*)?$/i.exec(value);
 if(!match||match[2]==='embed')throw new Error('Use a direct supported HTTPS board URL, such as https://job-boards.greenhouse.io/figma, or provider:slug.');
 const providers={'boards.greenhouse.io':'greenhouse','job-boards.greenhouse.io':'greenhouse','jobs.lever.co':'lever','jobs.eu.lever.co':'lever-eu','jobs.ashbyhq.com':'ashby'};
 return providers[match[1].toLowerCase()]+':'+match[2];
}))];
if(c.boards.length>20)throw new Error('Select at most 20 boards.');
`;
const code=(name,jsCode,x,y)=>({id:name.toLowerCase().replaceAll(' ','-'),name,type:'n8n-nodes-base.code',typeVersion:2,position:[x,y],parameters:{jsCode,mode:'runOnceForAllItems'}});
const http=(name,url,x,y,extra={})=>({id:name.toLowerCase().replaceAll(' ','-'),name,type:'n8n-nodes-base.httpRequest',typeVersion:4.2,position:[x,y],parameters:{url,authentication:'genericCredentialType',genericAuthType:'httpHeaderAuth',options:{timeout:90000,response:{response:{responseFormat:'json'}}},...extra}});
for(const kind of Object.keys(headers)){
 const olive=kind==='oliveyoung',actor=olive?'cemented_jest~oliveyoung-global-bestsellers':'cemented_jest~ats-jobs-change-monitor';
 const settings={spreadsheetId:'REPLACE_WITH_YOUR_SPREADSHEET_ID',sheetTab:olive?'OliveYoungHistory':'JobsHistory',historyStoreName:olive?'n8n-oliveyoung-history-v1':'n8n-jobs-history-v1',maxItems:100,maxChargeUsd:0.25,...(olive?{}:{boardUrls:'https://job-boards.greenhouse.io/figma',keyword:'',sendEmail:false,emailFrom:'',emailTo:''})};
 const fields=Object.entries(settings).map(([name,value])=>({id:name,name,value,type:typeof value}));
 const nodes=[
 {id:'manual',name:'Manual test',type:'n8n-nodes-base.manualTrigger',typeVersion:1,position:[0,0],parameters:{}},
 {id:'schedule',name:'Daily at 09 UTC',type:'n8n-nodes-base.scheduleTrigger',typeVersion:1.2,position:[0,220],parameters:{rule:{interval:[{field:'days',daysInterval:1,triggerAtHour:9,triggerAtMinute:0}]}}},
 {id:'settings',name:'Settings',type:'n8n-nodes-base.set',typeVersion:3.4,position:[220,0],parameters:{assignments:{assignments:fields},options:{}}},
 code('Validate settings',`const c=$input.first().json;
if(!/^[a-zA-Z0-9_-]{20,}$/.test(c.spreadsheetId)||c.spreadsheetId.startsWith('REPLACE_'))throw new Error('Set your Google spreadsheet ID before starting a billed Actor run.');
if(!c.sheetTab||!/^[a-zA-Z0-9][a-zA-Z0-9-]{1,60}$/.test(c.historyStoreName))throw new Error('Set the sheet tab and a valid history store name.');
if(!Number.isInteger(c.maxItems)||c.maxItems<1||c.maxItems>${olive?100:1000})throw new Error('maxItems is outside the supported range.');
if(typeof c.maxChargeUsd!=='number'||c.maxChargeUsd<c.maxItems*0.002||c.maxChargeUsd>10)throw new Error('Set maxChargeUsd between maxItems * $0.002 and $10.');
${olive?'':`if(!c.boardUrls?.trim())throw new Error('Set at least one supported job-board URL.');
${normalizeBoardsCode}
if(c.sendEmail&&(!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(c.emailTo)||!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(c.emailFrom)))throw new Error('Set valid sender and recipient addresses before enabling email.');`}
return [{json:c}];`,440,0),
 http('Start Actor',`https://api.apify.com/v2/acts/${actor}/runs`,660,0,{method:'POST',sendQuery:true,queryParameters:{parameters:[{name:'waitForFinish',value:'60'},{name:'timeout',value:'180'},{name:'memory',value:'256'},{name:'maxTotalChargeUsd',value:'={{ $json.maxChargeUsd }}'}]},sendBody:true,specifyBody:'json',jsonBody:olive?'={{ JSON.stringify({categoryIds:["all"],maxItemsPerCategory:$json.maxItems,trackChanges:true,historyStoreName:$json.historyStoreName,proxyConfiguration:{useApifyProxy:false}}) }}':'={{ JSON.stringify({boards:$json.boards,keyword:$json.keyword,maxItems:$json.maxItems,trackChanges:true,historyStoreName:$json.historyStoreName,onlyChanges:true}) }}'}),
 code('Validate run',`const r=$input.first().json.data;
if(!r?.id||!r.status)throw new Error('Apify did not return a run.');
if(['FAILED','ABORTED','TIMED-OUT'].includes(r.status))throw new Error('Actor '+r.status+'. Inspect https://console.apify.com/actors/runs/'+r.id);
if(!['SUCCEEDED','READY','RUNNING','TIMING-OUT','ABORTING'].includes(r.status))throw new Error('Unexpected run status '+r.status);
if(r.status!=='SUCCEEDED'&&Date.now()-Date.parse(r.startedAt)>360000)throw new Error('Run polling deadline exceeded. Inspect the existing run; do not start a duplicate.');
return [{json:{run:r}}];`,880,0),
 {id:'run-finished',name:'Run finished?',type:'n8n-nodes-base.if',typeVersion:2.2,position:[1100,0],parameters:{conditions:{options:{caseSensitive:true,leftValue:'',typeValidation:'strict',version:2},conditions:[{id:'succeeded',leftValue:'={{ $json.run.status }}',rightValue:'SUCCEEDED',operator:{type:'string',operation:'equals'}}],combinator:'and'},options:{}}},
 {id:'wait',name:'Wait 10 seconds',type:'n8n-nodes-base.wait',typeVersion:1.1,position:[1100,250],parameters:{amount:10,unit:'seconds'}},
 http('Read existing run','=https://api.apify.com/v2/actor-runs/{{ $json.run.id }}',880,250),
 http('Read run summary','=https://api.apify.com/v2/key-value-stores/{{ $json.run.defaultKeyValueStoreId }}/records/SUMMARY',1320,0),
 code('Require complete output',`const s=$input.first().json;
if(s.status!=='succeeded')throw new Error('Run summary is '+s.status+'. Partial or budget-limited results were not written to Sheets. Inspect the existing run.');
return [{json:{run:$('Validate run').first().json.run}}];`,1540,0),
 http('Read saved dataset','=https://api.apify.com/v2/datasets/{{ $json.run.defaultDatasetId }}/items?format=json&clean=true&limit=1000',1760,0),
 code('Prepare sheet rows',`const rows=$input.all().flatMap(x=>Array.isArray(x.json)?x.json:[x.json]);
const seen=new Set();
return rows.map(r=>{
 if(!r.runId||!r.${olive?'productId':'id'})throw new Error('Missing stable output identity.');
 const row=${olive?`{recordKey:[r.runId,r.categoryId,r.productId].join(':'),observedAt:r.scrapedAt,productId:r.productId,name:r.name,brand:r.brand,categoryId:r.categoryId,rank:r.rank,previousRank:r.previousRank,rankChange:r.rankChange,price:r.price,previousPrice:r.previousPrice,priceChange:r.priceChange,priceChangePercent:r.priceChangePercent,currency:r.currency,isSoldOut:r.isSoldOut,comparisonStatus:r.comparisonStatus,isNewEntry:r.isNewEntry,productUrl:r.productUrl,runId:r.runId}`:`{recordKey:[r.runId,r.source,r.id].join(':'),observedAt:r.observedAt,source:r.source,id:r.id,board:r.board,title:r.title,location:r.location,departments:(r.departments??[]).join('; '),changeType:r.changeType,changedFields:(r.changedFields??[]).join('; '),url:r.url,runId:r.runId}`};
 for(const k of Object.keys(row))if(row[k]===null||row[k]===undefined)row[k]='';
 return {json:row};
}).filter(x=>{if(seen.has(x.json.recordKey))return false;seen.add(x.json.recordKey);return true;});`,1980,0),
 {id:'sheets',name:'Save history in Sheets',type:'n8n-nodes-base.googleSheets',typeVersion:4.6,position:[2200,0],parameters:{resource:'sheet',operation:'appendOrUpdate',documentId:{__rl:true,value:'={{ $("Settings").first().json.spreadsheetId }}',mode:'id'},sheetName:{__rl:true,value:'={{ $("Settings").first().json.sheetTab }}',mode:'name'},columns:{mappingMode:'autoMapInputData',value:{},matchingColumns:['recordKey'],schema:headers[kind].map(id=>({id,displayName:id,required:false,defaultMatch:id==='recordKey',display:true,type:'string',canBeUsedToMatch:true})),attemptToConvertTypes:false,convertFieldsToString:false},options:{cellFormat:'RAW',handlingExtraData:'error'}}}
 ];
 const connections={};
 const link=(from,to,index=0)=>{connections[from]??={main:[]};connections[from].main[index]??=[];connections[from].main[index].push({node:to,type:'main',index:0});};
 link('Manual test','Settings');link('Daily at 09 UTC','Settings');
 const chain=['Settings','Validate settings','Start Actor','Validate run','Run finished?'];for(let i=0;i<chain.length-1;i++)link(chain[i],chain[i+1]);
 link('Run finished?','Read run summary',0);link('Run finished?','Wait 10 seconds',1);link('Wait 10 seconds','Read existing run');link('Read existing run','Validate run');
 const end=['Read run summary','Require complete output','Read saved dataset','Prepare sheet rows','Save history in Sheets'];for(let i=0;i<end.length-1;i++)link(end[i],end[i+1]);
 if(!olive){
  nodes.push(code('Prepare optional alert',`const c=$('Settings').first().json;
if(!c.sendEmail)return [];
const rows=$('Prepare sheet rows').all().map(x=>x.json).filter(r=>['new','changed'].includes(r.changeType));
if(!rows.length)return [];
const clean=x=>String(x??'').replace(/[\\r\\n]+/g,' ').slice(0,250);
const lines=rows.slice(0,50).map(r=>[clean(r.changeType)+': '+clean(r.title)+' — '+clean(r.location),clean(r.url)].join('\\n'));
return [{json:{subject:'Job monitor: '+rows.length+' new or changed postings',text:lines.join('\\n\\n')+'\\n\\nFull history: https://docs.google.com/spreadsheets/d/'+c.spreadsheetId+'\\nNew means first seen in this monitored selection; it does not prove the posting was just published.'}}];`,2420,0));
  nodes.push({id:'email',name:'Send optional email',type:'n8n-nodes-base.emailSend',typeVersion:2.1,position:[2640,0],parameters:{fromEmail:'={{ $("Settings").first().json.emailFrom }}',toEmail:'={{ $("Settings").first().json.emailTo }}',subject:'={{ $json.subject }}',emailFormat:'text',text:'={{ $json.text }}',options:{}}});
  link('Save history in Sheets','Prepare optional alert');link('Prepare optional alert','Send optional email');
 }
 for(const n of nodes)if(n.type==='n8n-nodes-base.httpRequest'&&n.name!=='Start Actor'){n.retryOnFail=true;n.maxTries=3;n.waitBetweenTries=2000;}
 nodes.push({id:'instructions',name:'Read before enabling',type:'n8n-nodes-base.stickyNote',typeVersion:1,position:[0,-430],parameters:{width:1000,height:350,content:`## ${olive?'Olive Young Global price & rank history':'Greenhouse, Lever & Ashby job changes'}\n1. Import this workflow. It is inactive.\n2. Configure Settings; create the named Google Sheets tab with the supplied CSV headers.\n3. On every HTTP node, select the SAME Header Auth credential: Authorization = Bearer YOUR_APIFY_TOKEN. Never paste a token into the workflow JSON.\n4. Select your Google Sheets credential. ${olive?'':'Email is optional and disabled by default; configure SMTP + addresses before enabling it.'}\n5. Run manually, inspect saved rows, then enable the daily schedule (09:00 UTC).\n6. First run is a baseline. Later runs compare the same input and history. Avoid overlapping executions.\nDefault result fee: up to $0.20 per run; explicit $0.25 run cap. Separate n8n/account storage costs may apply. If saving fails, retry from Read saved dataset for the SAME run, because Actor history has already advanced.\nGuide: https://github.com/CRNO22/apify-workflow-examples/blob/main/docs/${kind}-to-sheets.md`}});
 const workflow={name:olive?'Olive Young Global prices and ranks to Google Sheets':'Greenhouse Lever Ashby job changes to Sheets and email',nodes,connections,active:false,settings:{executionOrder:'v1',timezone:'Etc/UTC',executionTimeout:600,saveExecutionProgress:true},pinData:{},tags:[]};
 fs.writeFileSync(path.join(root,'workflows',`${kind}-to-sheets.json`),JSON.stringify(workflow,null,2)+'\n');
 fs.writeFileSync(path.join(root,'samples',`${kind}-sheet-headers.csv`),headers[kind].join(',')+'\n');
}
console.log('Generated 2 inactive n8n workflows with no embedded credentials.');
