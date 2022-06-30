
function parseBbcode(message) {
  let shortTags = /\[[ibus]\]|\[\/[ibus]\]|\[\/color\]|\[\/link\]|\[code\]|\[\/code\]|\[img\]|\[\/img\]|\[video\]|\[\/video\]/;

  let tagArray = {
    "[img]": "<img src='",
    "[/img]": "' />",
    "[video]": "<iframe width='100%' src='",
    "[/video]": "' title='YouTube video player' frameborder='0' allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture' allowfullscreen></iframe>",
    "[code]": "<code>",
    "[/code]": "</code>",
    "[i]": "<i>",
    "[/i]": "</i>",
    "[b]": "<b>",
    "[/b]": "</b>",
    "[u]": "<u>",
    "[/u]": "</u>",
    "[s]": "<strike>",
    "[/s]": "</strike>",
    "[/color]": "</span>",
    "[/link]": "</a>",
  };
  
  if (message.match(/\[.*?\]/g)) {
    let splitText = message.match(/\[.*?\]/g);
    for (let i = 0; i < splitText.length; i++) {
      let match = splitText[i].match(shortTags);
      let matchColorOpen = splitText[i].match(/\[color=(.*?)\]/);
      let matchUrlOpen = splitText[i].match(/\[link=(.*?)\]/);

      if (match && match in tagArray) {
        message = message.replace(shortTags, tagArray[match[0]]);
      }
      if (matchColorOpen) {
        let colorTag = `<span style='color:${matchColorOpen[1]};'>`;
        message = message.replace(matchColorOpen[0], colorTag);
      }
      if (matchUrlOpen) {
        let urlTag = `<a href="${matchUrlOpen[1]}">`;
        message = message.replace(matchUrlOpen[0], urlTag);
      }
    }
  }
  return message;
}

export default parseBbcode;