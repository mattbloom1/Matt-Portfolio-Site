Edit resume.html, then regenerate the PDF (needs playwright):
  node -e "const{chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage();await p.goto('file://'+process.cwd()+'/scripts/resume/resume.html');await p.pdf({path:'public/resume/Matthew-Bloomfield-Resume.pdf',format:'Letter',preferCSSPageSize:true});await b.close()})()"

Then render the pages the site embeds (needs pdftoppm from poppler):
  pdftoppm -r 200 -png public/resume/Matthew-Bloomfield-Resume.pdf /tmp/resume-page
  python3 -c "from PIL import Image; import glob
for i,f in enumerate(sorted(glob.glob('/tmp/resume-page*.png')),1):
    im=Image.open(f).convert('RGB')
    for w,suf in [(1700,''),(900,'-900')]:
        im.resize((w,int(im.height*w/im.width)), Image.LANCZOS).save(f'public/resume/page-{i}{suf}.webp','WEBP',quality=88)"
