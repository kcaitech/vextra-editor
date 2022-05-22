const div = function () {
    const div = document.createElement("div");

    div.style.position = 'absolute';
    div.style.top  = '-9999px';
    div.style.left = '-9999px';
    // div.innerHTML = text;
    // div.style.fontFamily = font;
    // div.style.fontWeight = bold ? 'bold' : 'normal';
    // div.style.fontSize = size + 'pt'; // or 'px'
    document.body.appendChild(div);
    return div;
}();

// var getTextHeight = function(font) {

//     var text = $('<span>Hg</span>').css({ fontFamily: font });
//     var block = $('<div style="display: inline-block; width: 1px; height: 0px;"></div>');
  
//     var div = $('<div></div>');
//     div.append(text, block);
  
//     var body = $('body');
//     body.append(div);
  
//     try {
  
//       var result = {};
  
//       block.css({ verticalAlign: 'baseline' });
//       result.ascent = block.offset().top - text.offset().top;
  
//       block.css({ verticalAlign: 'bottom' });
//       result.height = block.offset().top - text.offset().top;
  
//       result.descent = result.height - result.ascent;
  
//     } finally {
//       div.remove();
//     }
  
//     return result;
// };

// var size = [ div.offsetWidth, div.offsetHeight ];
// document.body.removeChild(div);

export default function measureText(text: string, font: string, size?: number, bold?: boolean) {
    // if (isblackchar(text)) {
    //     text = '&nbsp'
    // }
    // if (!font) {
    //     font = 'Arial';
    // }
    div.innerHTML = text;
    div.style.fontFamily = font;
    div.style.fontWeight = bold ? 'bold' : 'normal';
    div.style.fontSize = size + 'pt'; // or 'px'
    
    return { cw: div.offsetWidth, ch: div.offsetHeight };
}