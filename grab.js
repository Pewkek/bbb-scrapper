var presentationImage = document.querySelector('div[class|="svgContainer"] g image');
if(!presentationImage)
{
  throw new Error("No presentation found");
}

presentationImage = presentationImage.href.baseVal;

var splittedUrl = presentationImage.split("/");
if(splittedUrl[splittedUrl.length - 2] != "svg" || splittedUrl[splittedUrl.length - 1].match(/\d+/) == null)
{
  throw new Error("This does not look like BBB presentation");
}

var baseUrl = splittedUrl.splice(0, splittedUrl.length - 2).join("/") + "/";

async function getSlidesMeta(url)
{
  return fetch(url)
  .then(response => response.text())
  .then(str => new window.DOMParser().parseFromString(str, "text/xml"))
  .then(data => data.querySelector("slides").getAttribute("count"));
}

async function createPDF()
{
  var slidesCount = await getSlidesMeta(baseUrl + "slides");
  var win = window.open("", "Prezentacja");

  var winDoc = win.document
  var imgW, imgH;

  for(var i=1;i<=slidesCount;i++)
  {
    var svgImg = winDoc.createElement("img");
    svgImg.src = baseUrl + "svg/" + i;
    winDoc.body.appendChild(svgImg);
  }
  
	var firstImg = winDoc.querySelector("img");

  firstImg.addEventListener("load", (e) => {
		let firstImg = winDoc.querySelector("img");
    let computedStyle = win.getComputedStyle(firstImg);
		imgW = parseFloat(computedStyle.width);
		imgH = parseFloat(computedStyle.height);
		var aspectRatio = imgW/imgH;
		imgW = Math.min(imgW, 1280);
		imgH = imgW/aspectRatio;
    var date = new Date();
    winDoc.title = "Presentation " + date.toLocaleDateString("en-GB", { year: "numeric", month: "2-digit", day: "2-digit" }).replaceAll("/", ".");
    var customCSS = winDoc.createElement("style");
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
	@page
	{
		margin: 0;
		padding: 0;
		size: ` + imgW + `px ` + imgH + `px;
	}

  *
  {
    margin: 0 !important;
    padding: 0 !important;
    float: left;
		box-sizing: border-box;
  }
  
  img
  {
		margin: 0;
		padding: 0;
    width: 100vw !important;
    height: 100vh !important;
		page-break-inside: avoid !important;
    page-break-after: always !important;
  }
}`.trim();
    winDoc.body.appendChild(customCSS);
    
  });
}

createPDF().then();