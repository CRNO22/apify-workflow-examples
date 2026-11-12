import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const load=k=>JSON.parse(fs.readFileSync(new URL(`../workflows/${k}-to-sheets.json`,import.meta.url)));
const workflows={oliveyoung:load('oliveyoung'),jobs:load('jobs')};
function run(kind,name,rows,lookups={}){
 const n=workflows[kind].nodes.find(x=>x.name===name);
 const input=rows.map(json=>({json}));
 const $=key=>({first:()=>({json:lookups[key]?.[0]}),all:()=>lookups[key]?.map(json=>({json}))??[]});
 return JSON.parse(JSON.stringify(vm.runInNewContext(`(function(){${n.parameters.jsCode}\n})()`,{$input:{first:()=>input[0],all:()=>input},$,Date},{timeout:1000})));
}
const settings={spreadsheetId:'a'.repeat(40),sheetTab:'History',historyStoreName:'test-history',maxItems:100,maxChargeUsd:0.25,boardUrls:'https://job-boards.greenhouse.io/figma',keyword:'',sendEmail:false,emailFrom:'',emailTo:''};
for(const kind of Object.keys(workflows)){
 test(`${kind}: inactive, credential-free, connected graph and bounded billing`,()=>{
  const w=workflows[kind], names=new Set(w.nodes.map(x=>x.name));assert.equal(names.size,w.nodes.length);assert.equal(w.active,false);
  assert.equal(w.settings.executionTimeout,600);
  for(const [from,con] of Object.entries(w.connections)){assert.ok(names.has(from));for(const branch of con.main)for(const to of branch)assert.ok(names.has(to.node));}
  for(const node of w.nodes){assert.ok(!node.credentials);if(node.type==='n8n-nodes-base.code')new vm.Script(`(function(){${node.parameters.jsCode}\n})`);}
  const start=w.nodes.find(n=>n.name==='Start Actor');assert.equal(start.parameters.method,'POST');assert.ok(!start.retryOnFail);assert.equal(start.parameters.queryParameters.parameters.find(p=>p.name==='maxTotalChargeUsd').value,'={{ $json.maxChargeUsd }}');
  const sheets=w.nodes.find(n=>n.name==='Save history in Sheets');assert.equal(sheets.parameters.operation,'appendOrUpdate');assert.deepEqual(sheets.parameters.columns.matchingColumns,['recordKey']);assert.equal(sheets.parameters.options.cellFormat,'RAW');
  for(const n of w.nodes.filter(n=>n.type==='n8n-nodes-base.httpRequest'))assert.equal(n.parameters.genericAuthType,'httpHeaderAuth');
  assert.ok(!/(apify_api_[A-Za-z0-9]{20,}|ghp_[A-Za-z0-9]{20,})/.test(JSON.stringify(w)));
 });
 test(`${kind}: invalid configuration fails before starting an Actor`,()=>{
  assert.equal(run(kind,'Validate settings',[settings])[0].json.spreadsheetId,settings.spreadsheetId);
  for(const bad of [{spreadsheetId:'REPLACE_WITH_YOUR_SPREADSHEET_ID'},{maxItems:0},{maxChargeUsd:0.01},{maxChargeUsd:99},{historyStoreName:'../bad'}])assert.throws(()=>run(kind,'Validate settings',[{...settings,...bad}]));
 });
 test(`${kind}: failures, partial results and expired polling stop output`,()=>{
  for(const status of ['FAILED','TIMED-OUT','ABORTED','UNKNOWN'])assert.throws(()=>run(kind,'Validate run',[{data:{id:'r',status,startedAt:new Date().toISOString()}}]));
  assert.throws(()=>run(kind,'Validate run',[{data:{id:'r',status:'RUNNING',startedAt:'2000-01-01T00:00:00Z'}}]));
  for(const status of ['partial','failed','budgetLimit'])assert.throws(()=>run(kind,'Require complete output',[{status}]));
  const r={id:'r',status:'SUCCEEDED',defaultDatasetId:'d'};
  assert.equal(run(kind,'Require complete output',[{status:'succeeded'}],{'Validate run':[{run:r}]})[0].json.run.id,'r');
 });
}
test('Olive Young projection preserves zero, false and null comparisons; retry keys stable',()=>{
 const r={runId:'r1',productId:'p1',categoryId:'all',name:'=IMPORTXML("bad")',price:0,isSoldOut:false,rank:1,previousRank:null,scrapedAt:'2026-11-12'};
 const a=run('oliveyoung','Prepare sheet rows',[r,r]);assert.equal(a.length,1);assert.equal(a[0].json.price,0);assert.equal(a[0].json.isSoldOut,false);assert.equal(a[0].json.previousRank,'');assert.equal(a[0].json.name,r.name);
 assert.equal(a[0].json.recordKey,run('oliveyoung','Prepare sheet rows',[r])[0].json.recordKey);
 assert.notEqual(a[0].json.recordKey,run('oliveyoung','Prepare sheet rows',[{...r,runId:'r2'}])[0].json.recordKey);
});
test('job projection preserves changed fields and distinguishes sources',()=>{
 const r={runId:'r1',id:'1',source:'greenhouse',title:'Engineer',departments:['Engineering','AI'],changedFields:['title'],changeType:'changed'};
 const rows=run('jobs','Prepare sheet rows',[r,{...r,source:'ashby'}]);assert.equal(rows.length,2);assert.equal(rows[0].json.departments,'Engineering; AI');assert.equal(rows[0].json.changedFields,'title');assert.notEqual(rows[0].json.recordKey,rows[1].json.recordKey);
});
test('email is off by default; baseline and unchanged rows never trigger alerts',()=>{
 const look={'Settings':[settings],'Prepare sheet rows':[{changeType:'new'}]};assert.equal(run('jobs','Prepare optional alert',[{}],look).length,0);
 look.Settings=[{...settings,sendEmail:true}];look['Prepare sheet rows']=[{changeType:'baseline'},{changeType:'unchanged'}];assert.equal(run('jobs','Prepare optional alert',[{}],look).length,0);
 look['Prepare sheet rows']=[{changeType:'new',title:'Engineer',url:'https://example.com/a'},{changeType:'changed',title:'Designer',url:'https://example.com/b'}];
 const a=run('jobs','Prepare optional alert',[{}],look);assert.equal(a.length,1);assert.match(a[0].json.subject,/2 new or changed/);assert.match(a[0].json.text,/Engineer/);
});
test('email requires explicitly configured addresses',()=>{
 assert.throws(()=>run('jobs','Validate settings',[{...settings,sendEmail:true}]));
 assert.ok(run('jobs','Validate settings',[{...settings,sendEmail:true,emailTo:'recipient@example.com',emailFrom:'sender@example.com'}]));
});
test('saved run output and request bodies use parseable expressions',()=>{
 for(const [kind,w] of Object.entries(workflows)){
  const start=w.nodes.find(n=>n.name==='Start Actor');
  const expression=start.parameters.jsonBody.slice(3,-2).trim();
  const body=JSON.parse(vm.runInNewContext(expression,{$json:run(kind,'Validate settings',[settings])[0].json}));assert.equal(body.maxItems??body.maxItemsPerCategory,100);assert.equal(body.trackChanges,true);
  if(kind==='jobs'){assert.deepEqual(body.boards,['greenhouse:figma']);assert.equal(body.onlyChanges,true);}
  else assert.deepEqual(body.categoryIds,['all']);
 }
});

test('workflow accepts board URLs before the Actor URL-input release and rejects unrelated hosts',()=>{
 const c={...settings,boardUrls:'https://job-boards.greenhouse.io/figma\nhttps://jobs.lever.co/palantir\nhttps://jobs.ashbyhq.com/openai\ngreenhouse:figma'};
 assert.deepEqual(run('jobs','Validate settings',[c])[0].json.boards,['greenhouse:figma','lever:palantir','ashby:openai']);
 for(const boardUrls of ['https://example.com/foo','http://jobs.lever.co/foo','https://jobs.lever.co@evil.com/foo','https://jobs.lever.co/foo/../bar','https://jobs.lever.co/foo/%2e%2e','https://boards.greenhouse.io/embed/job_board?for=figma'])assert.throws(()=>run('jobs','Validate settings',[{...settings,boardUrls}]));
});
