// 光标样式处理   ---.svg + 角度 = base64
import { v4 as uuid } from "uuid";

const auto = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAAXNSR0IArs4c6QAAAARzQklUCAgICHwIZIgAAAHLSURBVHic7djPi01hHAbwDyKkEJqiZKGUWPAfYCFWysKGomTDSpEpCwulLNggSztFSf4ARaMsLJSyQGpMsxCL8aPUiGsx86aMyb3nvOd9dft+6tvdnfM8z+5cQgghhBBCCCGEEEIIIYQQQgghhDDsFtUOgLOzvxM1Xr6wxkv/MIExPMTuylmqWI3v6M3eE+yrmqiCR34PkO4ZDtQMVdIZcwdI9wKHsKBaugK2mn+AdK9wDIsrZezca/8eoYdxnMSyOjG7c1V/A6SbxGmsqBG2C3sMNkC69xjFqvKR81qCKc1G6OEjLmBN4dxZ3dV8gHRTuISRwtmzOKL9AOm+4ArWF23Q0lr8kG+EHr7hOjaVq9HOmLwDpJvGLWwp1qShUd0MkO4n7mBDqUKD2q7bAb7icLE2Db3VTflJ7CzYo7Fr8pd/iY0lS7SxV97y97GyaIOWluKzPOUvF86ezT3tik/jVPHUGR3VvPwH7CqeOLMRzcq/weYKeTvx1GDlH2NdlaQdOa//8jfMfFIPlR36K3+uVsASxs1f/BMO1otWxk1/L/8O2yrmKma/ueWf+4+/5nJbbuYLLpW/bYj+Ce7XAzPlL9YOUstxnOjiwb8AjMSX+/6xUjMAAAAASUVORK5CYII=';
const cross = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAAXNSR0IArs4c6QAAAARzQklUCAgICHwIZIgAAAGQSURBVHic7dgxSwJxGAbwpy4UJ+HORThQkNJv4ODU5Nwi+hka2hzDFkfBhjZp7Qs0tORwDg7hYlOTfxxCzOGPCSIcNrUEhX8MnqDnN93y8j48cBzvASIiIiIiIiLy3xywFjebzbBarZ4BQBRFD61W64WR44ixFACKxeJxJpO5ttaiVCo1AFAKOGQs/TQejxFFETMCt4C/QAWwA7CpAHYANhXADsCmAtgB2FQAOwDb3sdQp9PxPc8LXOfiOA4/nzebTbbb7R67zM9ms/d2u/3quvervc/h+Xx+ORwOr6y1TnNxHMPzPBhjkM/nsd1ud55Np9OoVCo3vu+fu+b96lfOYWstjDFOM4lEAtlsFgCwWCywXC53ns3lck67frJ3AYPB4D4IgrcgcHsLVqvVyXq9vgCAMAxvU6nUk8t8v99/dlr4DdofoV6vd5pMJh+NMSgUCo16vX7HyPHvvwIqgB2ATQWwA7CpAHYANhXADsCmAtgB2GgFTCaTdblcHtVqtdF0Ot39FBQRERERERERkf18ALeMZMtJ7/n3AAAAAElFTkSuQmCC';
const scale = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAAXNSR0IArs4c6QAAAARzQklUCAgICHwIZIgAAAIySURBVHic7dQxaBphFAfwV8goBAoiNJ0O0a6CECneVJE6tUO2LA5dxMkDiZEOWTwE4QriWEXwAg7ipYi00IMblGIPB+siisgJCopg6CAolH7dpCGU9PQcSv+/8T2+//vu8XFEAAAAAAAAAAAAAAAAAGBWOp0+7vf7qclkcml19mQyuez3+6l0On1sdbYlOp3ORbfbvZVlmTHGrqzOZ4xdybLMut3ubafTubA6f2e6rp/3er2pKIrM4XCwUCh0sAWEQiHmcDiYKIqs1+tNdV0/3zf3aNeDqqq+dDqd7+r1+jNJkmg+n297y+XyJJfLne57ud8tl8sTIqLVakWiKFI+n38iCIJsGMbb4XAYCwQCn3bJfWT2QKVSOfV6vVKr1XouiiKNRqM7fZfLRYIg7HKXB0mSRIPB4E6N4zhKJpPk8/m+tNtt4ezs7KuZTNMvgOO44Gaz8Wiadu/jiYjW6zWNx2OzsX9lvV7fq41GI9I0jTwej8ftdr8gIlMLMP0CiIhisdjjSCSSWiwWbzKZzJGqqtsez/NULBZvms3mh12y/8Tv978Kh8OvG43GthYIBCgej/+w2+3vq9VqIpFIfLdy5oNKpZLbMIxrTdMYz/PMZrMd/Cdos9kYz/NMVdWfhmFcFwoFzupZppXLZd94PP6sKAqLRqMHW0A0GmWKojDDMD6Wy2Wf1TP2VqvVgtPp9NuhFjCbzfRarRa0Otty2Wz26b+QCQAAAAAAAAAAAAAAAP+TX3cWDFCH91D8AAAAAElFTkSuQmCC';
const rotate = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAAXNSR0IArs4c6QAAAARzQklUCAgICHwIZIgAAARaSURBVHic7dZPSJt3GAfw5xeNaZN30+Sd1v+LOss0YK2O6dZisah1oOs8eNnK8NLDDr2IelGcDMVD2cWp2M7hwUVnuwwqCxONjbLGf4cVZbwgsllaJcbkNf553yRvTPLsZOllsHZv37fC7wM5BF6+z5cvLyEAFEVRFEVRFEVRFEVRlPpmZmZuDQ4OGpW4pVHiyMtobGyM29nZ6fP5fB6XyzU6MTFxTe1Oiurv7z/f1taGDMMgy7LY1NSEQ0NDTzmOax0YGEiV+16c3IH/V2NjYxnHcV9wHAfRaBQ4joPp6elErVZb3dDQUKnX62cXFhb8ct2LlytILizLpns8nhe/Q29v735aWtqtwsLCH+W+98b9BqSlpZm2t7chOzsb6urqwO/3Q3pqKikvLn6kdjdF8Dzf2dfXd7y4uDiw9eTJo6KiIqyoqMDA4eHPandTxOrqav3IyEg+AEBYEC7YJyePGYbB4Tt3MCQI1Wr3U1xYFL/77Pp1PJ+fj7zHs6B2H8UFeD5z/uFD4eQtOA4GL6vdSXEhURysqa7GkpISFA4OJtXuo7hQKJT364MHIYZh8Jf79yPS4eH7andSnCSKNovFgp/W16Mkih1y5b5x/wP+VSxmra2pAdfCAni93ga5Yk/NAEI47LhWU3MoSRLMOBwlAZ7PUruT4kKCYD+XkoJf3riBYUFokiPz1LwBAACI+NhiscCzrS1AQnLlyDxVA2gAHlsKC2FrawsA8V2ZMk+RuDg8q9fD/sEBACEpckSeqgEIQLbb7YYcsxkQYFuOzFM1ACJe2djYgJycHCCIf6ndR1HBYDB7ym4/ZhgGJ8bH8TgYvKJ2p/9keHj4PY7jvu/q6jK9agYeHSU/3dz8s7S0FAsKCnDf53PK2fG1sFqtxUtLS+MdHR3R0dHR/VfNiYhi3d8bG+ulpaVoNBrRdu9eIBwIlMvZVVY2m63K6XRONzc3I8uyyDAMOhyO6ZfJCItiiSSKXx/4fH98e/s2ZmVlodFoxB/u3o1KgvC5nH2JnGEul2t2bGzsqtVqhUgkAgAASUlJsLy4+Owdk2kNEHkE4AkhR0DIGYzFzmgI0SEiE43F0t1ud8aOx5O5tramd87Pw8rKCvh4Hi5fugTfdHa6L1y82KzT63+Ss7OsA9hstpK9vb251tbWt04GOKHVaiElORlYlgWDwQCSJD3/iIEAeHd3IRKNPn8+LzcXrlZWQnVVVbCqsnJIazD0EEJ4OfsCyDwAAIDdbv/A7XbPtbS0GCKRCNTW1sLHZWWw6/WC3+8Hv98PgiiCNj4eEnQ60CUkQIJOB+dSUiDHbAaz2Qx5eXm+zIyM3wHRlhCN/kYSE/fk7nlC9gEAAKampj5cX1+fa29vP9vT07P/1c2bn8QQTQTRhIgmotG8rUGMoEYjAaIEABIC+ABxM8Fg2CSEHL2OXopyOp3l3d3dodnZWbvaXVTjcrk+Wl5eblO7B0VRFEVRFEVRFEVR1Iv+Acf+6EqlVofhAAAAAElFTkSuQmCC';
const extend = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAAXNSR0IArs4c6QAAAARzQklUCAgICHwIZIgAAAT1SURBVHic7ZpvSBtnHMd/04C+OGwYdGNeu8a7ouLwhUNoVpoX2xK7BNsN9YVFFKd545sMU0xtaOEYGAJCxqzomyrCJSPMP2yVailh98I/zYweLgHPRJGLxhehVh1oa13ssxdbZF2cQU3uHD4fOEjuued739+P5J7f8zwHgMFgMBgMBoPBYDASMzw8XDY8PFwmtw/ZEEVRWF5e/k1OD+/IdePJyclbgUDgBwAAmqZvabVat1xeZGFhYWGVpmlE0zRaWFhYlctHhhw35Xn+dn9/f240GoVoNAr9/f25PM+b5PAiOQzDZPv9/g2SJBFBEIggCESSJPL7/RsMw2TL7S/tCIJgs1gs+8HHD4vFggRBsMntL610dHRcmJmZealUKhMSoFQq0czMzMuOjo4LcvtMG/Pz891GozEh+PhhNBrR/Px8t5SeJBsG7Xb7Ob1ezxMEkQEAkJGRkTUxMfFBOByGurq6td3d3S0AgK2trTejo6Mft7a2/i6FL9nqgK6uLnVOTs6zcDgMhYWFX1dWVvbJ4UOWYfA0gRMgtwG5wQlIpZjdbj8XDAbbIpHI3VTqAgBEIpG7wWCwzW63n0ulbsoSMDs7e8dgMIg+n89KkmRWqnTjkCSZ5fP5rAaDQZydnb2TKt0TJ2BqaqpGEITVkZERu06nU7pcrlT4OhCXywU6nU45MjJiFwRhdWpqquakmorjdvR4PF9cvnz5u8ePHxc6HA6IRqP7bevr62RnZ+eVw/ojhD6Kf47FYlSy69fX10kAgO3tbbDZbNDT05NrNpudoijeW1xcbNZqtU+OE8eRC6GBgYErpaWlDq/Xe9Vms8HS0tJb7fn5+WA2m5Pq7O3tQWZmJoTDYaBpGmKxWNI+DocDQqHQW+coigKr1QpqtXpyenraXFVV9etR4jnyL4CiqLLXr1+XcByXEDwAwM7ODoTD4eQ3ViiAJEkAAHjx4gVsbm4m7bOzs5NwbmlpCTiOg5KSkpKCgoLPAeBICThWKdzc3PxuU1NT2/Pnz43t7e0Kj8ez36bRaKCvr++n8fHxnw/TePXqFQ0A9/4uhXsAYPyw669du/ZlfX39V2NjY/vntFottLS0xM6fP/9waGioVar5wz4syxaIoujiOA5pNBpEEATS6/UIIcQk69vV1aV2Op2ora0NDQ4O1ie7HiHE6PV6RBAE0mg0yOPxvBFF0dXb20udJIYTjQK1tbVBlUpVE41GP3E6nR6WZYGiTuTnUCiKApZlgWXZJ2tra1dVKlVNQ0ND4v/wCKSkDqiurvZeunRJp1AorlutVn8qNA/i/v37PoVCcV2lUumrq6u9qdA89jB4EDdu3HgKAE/Tsarz4MGDhyaTiUm1blrmAiaTKfJ/0ATAkyGcgDOfgJQ+BA+DYZjsmzdvfhP/vru7++Hi4iIAAOTl5Rl4nn8/3vbo0aPvGYZJLPvSgKSLoisrK78MDQ19Ojc3BwB/lbHb29tQXFwMAABFRUVQUVHBXbx48TMpfUmG2+1Wcxz3n/sCHMcht9utlttnWhFF8cfy8vKE4MvLy5EoiulbTDgtsCxb4PV69/6dgImJiT9Yli2Q258khEKh7sbGxv3gGxsbUSgUknRLTFb+uUka3xRtb29/T25fkhLfJrdYLGhubu5buf1IDsMw2YFAYCMQCJyNFyMOguf522fm1RgMBoPBYDAYDAZzqvgTRdMvhWekZtsAAAAASUVORK5CYII=';
interface StyleSheetController {
  getId: Function
  setup: Function
  remove: Function
  appendClass: Function
  getClass: Function
}
const getBase64ByType = new Map([
  ['auto', auto],
  ['cross', cross],
  ['scale', scale],
  ['rotate', rotate],
  ['extend', extend],
])

const hot = [16, 16]; // 光标热点在svg的位置

// 返回一个StyleSheetController对象
function styleSheetController(): StyleSheetController {
  let styleSheetId: string = '';
  let style: HTMLStyleElement;
  const classList: Map<string, string> = new Map();

  // 向document的head插入一个<style type='text/css' id='xxx'>标签
  async function appendStyleSheetForCursor() {
    style = document.createElement('style');
    style.type = 'text/css';
    styleSheetId = (uuid().split('-').at(-1)) || 'cursor'; // at() 可能存在浏览器兼容问题，后期观察👀；
    style.id = styleSheetId;
    // 预设一个auto
    style.innerHTML += await getClassString('auto', 0, styleSheetId);
    classList.set(`auto-0-${styleSheetId}`, `auto-0-${styleSheetId}`);
    document.querySelector('head')?.appendChild(style);
  }
  // 根据id移除一个<style>标签
  function removeStyleSheetForCursor() {
    if (styleSheetId.length) {
      const style = document.getElementById(styleSheetId);
      style?.remove();
    }
  }
  // 向style标签里面插入class样式
  function appendClass(clsName: string, cls: string) {
    if (style) {
      style.innerHTML += cls;
      classList.set(clsName, clsName);
    }
  }
  async function getClass(clsName: string) { //这个clsName是不带id的，只有类型和度数
    const arr = clsName.split('-');
    arr[1] = findNearestMultipleOf(Math.floor(((Number(arr[1]) % 360))), 3).toString();
    clsName = `${arr[0]}-${arr[1]}-${styleSheetId}`;
    // 如果获取的过程中无法从已有的样式库中取得样式，则先创建一个样式插入到样式库
    if (!classList.get(clsName)) {
      const [type, deg] = clsName.split('-');
      const cls: string = await getClassString(type, Number(deg), styleSheetId);
      appendClass(clsName, cls);
      return clsName;
    } else {
      return classList.get(clsName) || `auto-0-${styleSheetId}`;
    }
  }

  async function getClassString(type: string, deg: number, id: string) {
    let src: string = getBase64ByType.get(type) || auto;
    const result = await rotateBase64Image(src, deg);
    let str = `.${type}-${deg}-${id} {`;
    if (result) {
      src = (result as string);
      str += `cursor: -webkit-image-set(url(${src}) 2x) ${hot[0]} ${hot[1]}, auto;`;
    }
    str += '}'
    return str;
  }
  function getId() {
    return styleSheetId;
  }
  return {
    getId,
    setup: appendStyleSheetForCursor,
    remove: removeStyleSheetForCursor,
    appendClass,
    getClass,
  };
}

// image/svg+xml -rotate-> image/svg+xml;
function rotateBase64Image(base64Image: string, angle: number) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.src = base64Image;
    image.onload = function () {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      const radians = angle * Math.PI / 180;
      const cos = Math.abs(Math.cos(radians));
      const sin = Math.abs(Math.sin(radians));
      const width = image.width * cos + image.height * sin;
      const height = image.width * sin + image.height * cos;

      canvas.width = width;
      canvas.height = height;
      context?.translate(width / 2, height / 2);
      context?.rotate(radians);
      context?.drawImage(image, -image.width / 2, -image.height / 2);

      const rotatedBase64Image = canvas.toDataURL('image/png');
      // const rotatedBase64Image = canvas.toDataURL('image/svg+xml');
      resolve(rotatedBase64Image);
    };
    image.onerror = function () {
      reject('Invalid base64 image');
    }
  });
}

// step, 输入一个整数A，返回可以被step整除的离A最近的一个整数B
function findNearestMultipleOf(num: number, step?: number): number {
  step = step || 3
  let closest = Math.round(num / step) * step;
  if (closest < num) {
    closest += step;
  }
  return closest;
}
export { StyleSheetController, styleSheetController }