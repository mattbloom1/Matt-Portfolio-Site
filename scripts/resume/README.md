Edit resume.html, then regenerate the PDF (needs playwright):
  node -e "const{chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage();await p.goto('file://'+process.cwd()+'/scripts/resume/resume.html');await p.pdf({path:'public/resume/Matthew-Bloomfield-Resume.pdf',format:'Letter',preferCSSPageSize:true});await b.close()})()"
