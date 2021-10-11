let presentationImage = document.querySelector('#container > div > div > div > div[class^=\'svgContainer\'] > div > svg > g > g:nth-child(1) > g > image').href.baseVal;

let splittedUrl = presentationImage.split("/");
if(splittedUrl[splittedUrl.length - 2] != "svg" || splittedUrl[splittedUrl.length - 1].match(/\d+/) == null)
{
  throw new Error("This does not look like BBB presentation");
}

let baseUrl = splittedUrl.splice(0, splittedUrl.length - 2).join("/") + "/";

async function getSlidesMeta(url)
{
  return fetch(url)
  .then(response => response.text())
  .then(str => new window.DOMParser().parseFromString(str, "text/xml"))
  .then(data => data.querySelector("slides").getAttribute("count"));
}

async function createPDF()
{
  let slidesCount = await getSlidesMeta(baseUrl + "slides");
  
  let win = window.open("", "Prezentacja");
  let winDoc = win.document
  let imgWidth, imgHeight;
  
  for(i=1;i<=slidesCount;i++)
  {
    let svgImg = winDoc.createElement("img");
    svgImg.src = baseUrl + "svg/" + i;
    winDoc.body.appendChild(svgImg);
  }
  
  win.addEventListener('load', (e) => {
    let firstImg = winDoc.querySelector("img");
    let computedStyle = win.getComputedStyle(firstImg)
    imgWidth = parseInt(computedStyle.width)/100 + "cm";
    imgHeight = parseInt(computedStyle.height)/100 + "cm";
    let date = new Date();
    winDoc.title = "Prezentacja " + date.getDate() + "." + (date.getMonth() + 1) + "." + date.getFullYear();
    let customCSS = winDoc.createElement("style");
    customCSS.textContent = `*
{
  margin: 0;
  padding: 0;
}

body
{
  background-color: #2F2F2F;
  display: block;
  width: 100%;
}

img
{
  width: 60%;
  height: auto;
  margin-bottom: 2em;
  background-color: white;
  display: block;
  margin-left: auto;
  margin-right: auto;
  float: none;
}

img:first-of-type
{
  margin-top: 5em;
}

img:last-of-type
{
  margin-bottom: 5em;
}
@media print
{
  title
  {
    display: none;
  }
  
  *
  {
    margin: 0 !important;
    padding: 0 !important;
    float: left;
  }
  
  @page
  {
    size: ` + imgWidth + " " + imgHeight + `;
    margin: 0;
  }
  
  img
  {
    width: ` + imgWidth + `;
    height: ` + imgHeight + `;
  }
}`.trim();
    winDoc.body.appendChild(customCSS);
    //win.print();
    
  }, false);
}

createPDF();