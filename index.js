const request = require('request');
//request.debug = true;
const gbk = require('gbk');

//搜索建议
//http://vs.sugg.sogou.com/sugg/ajaj_json.jsp?key=%E4%BA%BA%E9%97%B4zhiwei&type=vc&ori=yes&pr=vc&abtestid=&ipn=&vzd=1
//window.sogou.sug(["无心法师",["无心法师2|serial","无心法师第一季|serial","无心法师216|serial","无心法师215|serial","无心法师 第二季|serial","无心法师ⅱ|serial"]],-1);
//serial:连续剧
//movie:电影
//tv:娱乐
//[0] 搜索关键字 [2] 建议结果


// 搜索结果

// http://v.sogou.com/vc/suggresult?query=无心法师第二季&type=serial&pos=1
// query 中文 type 类型 pos 偏移量
// 包括中文等等

// http://v.sogou.com/v?query=%CE%DE%D0%C4%B7%A8%CA%A62&tvsite=qq.com&sourceid=sugg&noClassify=true&showLoc=right&ri=0
// 搜索结果中，有多视频源，需要根据不同的视频源进行跳转.
// 搜索结果中，longvideo_info，source，key_list，encodeQuery

// 跳转链接解析，/style_2017/js/search.min.js?t=2017071417

// http://v.sogou.com/vc/eplay?query=%CE%DE%D0%C4%B7%A8%CA%A62%202%20site:tv.sohu.com&title=%CE%DE%D0%C4%B7%A8%CA%A62&key=teleplay_615191&j=2&st=6&tvsite=tv.sohu.com

// 跳转链接，

// window.open('http://tv.sohu.com/20170814/n600103291.shtml?txid=72b6b32533ae9786a2b937d2736efa18&fromvsogou=1','_self');

// 匹配链接

//

var options = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.101 Safari/537.36',
  'Accept-Language': 'zh-CN,zh;q=0.8',
  'encoding': null,
  'timeout': 1500
}

var query = encodeURIComponent('火影忍者');
var req = Object.assign(options, { url: `http://vs.sugg.sogou.com/sugg/ajaj_json.jsp?key=${query}&type=vc&ori=yes&pr=vc&abtestid=&ipn=&vzd=1` });

search();
async function search() {
  request(req, async function (error, response, body) {
    if (error) {
      console.error(error);
    } else {
      let script = gbk.toString('utf-8', body);
      let json = script.replace('window.sogou.sug(', '').replace(',-1);', '');
      //["无心法师",["无心法师2|serial","无心法师第一季|serial","无心法师216|serial","无心法师215|serial","无心法师 第二季|serial","无心法师ⅱ|serial"]]
      try {
        json = JSON.parse(json);
        let key, suggest;
        if (json.length > 0) {
          key = json[0];
          suggest = json[1];
          console.log(`搜索关键字:${key}`);
          console.log(`搜索的结果:${suggest}`);
          await fecth(query);
          for (let i = 0; i < suggest.length; i++) {
            let query = encodeURIComponent(suggest[i].split('|')[0]);
            await fecth(query);
          }
        }

      } catch (e) {
        console.log(e);
      }
    }
  });
}

//http://v.sogou.com/v?query=%CE%DE%D0%C4%B7%A8%CA%A62&tvsite=qq.com&sourceid=sugg&noClassify=true&showLoc=right&ri=0
async function fecth(query) {
  return new Promise(async (resolve, reject) => {
    console.log('-----------------------------------------')
    console.log('开始搜索资源：' + decodeURIComponent(query));
    let url = `http://v.sogou.com/v?query=${query}&tvsite=&sourceid=sugg&noClassify=true&showLoc=right&ri=0`;
    let req = Object.assign(options, { url: url });
    request(req, async function (error, response, body) {
      if (error) {
        console.error(error);
      } else {
        let html = gbk.toString('utf-8', body);
        if (html.indexOf('longvideo_info') > 0) {
          let reg = /longvideo_info = (.*);/g;
          let result = reg.exec(html);
          if (result != null && result[1]) {
            result = result[1];
            result = JSON.parse(result);
            let reg2 = /var key_list = "(.*)";/g;
            let result2 = reg2.exec(html);
            if (result2 != null && result2[1]) {
              let key_list = result2[1];
              key_list = key_list.split(';');
              for (let i = 0; i < key_list.length; i++) {
                let key = key_list[i];
                if (!key) {
                  continue;
                }
                let playInfo = result['playinfoList'][i];
                if (!playInfo) {
                  continue;
                }
                console.log(`资源标题:${playInfo.title}`);
                let sites = playInfo['item_list'];
                console.log('播放源个数:' + sites.length);
                for (let s = 0; s < sites.length; s++) {
                  let site = sites[s];
                  if (playInfo.format == 'serial') {
                    console.log('连续剧:----')
                    console.log('播放站点:' + site.siteName + ';当前状态:' + site.episode_range.all + ',收费状态:' + site.episode_range.fee);
                    await fecth2(query, key, site.site, site.episode_range.all);
                  } else if (playInfo.format == 'single') {
                    console.log('单集:---')
                    console.log('播放站点:' + site.siteName);
                    await fecth3(1, site, site.url);
                  } else if (playInfo.format == 'tvshow') {
                    console.log('综艺:---')
                    console.log('播放站点:' + site.siteName + ',总集数:' + site.latest.length);
                    await fecth4(query, key, site.site, site.latest);
                  }
                }
              }
            }
          }
        } else {
          console.log('无结果');
        }
        console.log('搜索资源完毕：' + decodeURIComponent(query));
      }
      resolve();
    });
  });
}
//http://v.sogou.com/vc/eplay?query=%CE%DE%D0%C4%B7%A8%CA%A62%202%20site:tv.sohu.com&title=%CE%DE%D0%C4%B7%A8%CA%A62&key=teleplay_615191&j=2&st=6&tvsite=tv.sohu.com
async function fecth2(query, key, site, range) {
  return new Promise(async (resolve, reject) => {
    let url, req;
    for (let j = 1; j <= range[0][1]; j++) {
      url = `http://v.sogou.com/vc/eplay?query=${query}%202%20site:${site}&title=${query}&key=${key}&j=${j}&st=6&tvsite=${site}`;
      req = Object.assign(options, { url: url });
      await new Promise((resolve, reject) => {
        request(req, function (error, response, body) {
          if (error) {
            console.error(error);
          } else {
            let html = gbk.toString('utf-8', body);
            //console.log(html);
            let reg = /window\.open\('(.*)','\_self'\);/g
            let result = reg.exec(html);
            if (result != null && result[1]) {
              result = result[1];
              console.log('站点:' + site + ',集数:' + j + ',地址:' + result);
            }
          }
          resolve();

        });
      });
    }
    resolve();
  });
}


//http://v.sogou.com/vc/eplay?query=%CE%DE%D0%C4%B7%A8%CA%A62%202%20site:tv.sohu.com&title=%CE%DE%D0%C4%B7%A8%CA%A62&key=teleplay_615191&j=2&st=6&tvsite=tv.sohu.com
async function fecth3(j, site, url) {
  return new Promise(async (resolve, reject) => {
    let req;
    url = `http://v.sogou.com/${url}`;
    req = Object.assign(options, { url: url });
    request(req, function (error, response, body) {
      if (error) {
        console.error(error);
      } else {
        let html = gbk.toString('utf-8', body);
        let reg = /window\.open\('(.*)','\_self'\);/g
        let result = reg.exec(html);
        if (result != null && result[1]) {
          result = result[1];
          console.log('站点:' + site + ',集数:' + j + ',地址:' + result);
        }
      }
      resolve();
    });
  });
}

//http://v.sogou.com/vc/eplay?query=%CE%DE%D0%C4%B7%A8%CA%A62%202%20site:tv.sohu.com&title=%CE%DE%D0%C4%B7%A8%CA%A62&key=teleplay_615191&j=2&st=6&tvsite=tv.sohu.com
async function fecth4(query, key, site, dates) {
  return new Promise(async (resolve, reject) => {
    let url, req;
    for (let j = 0; j < dates.length; j++) {
      url = `http://v.sogou.com/vc/eplay?query=${query}%202%20site:${site}&date=${dates[j]['date']}&title=${query}&key=${key}&st=6&tvsite=${site}`;
      req = Object.assign(options, { url: url });
      await new Promise((resolve, reject) => {
        request(req, function (error, response, body) {
          if (error) {
            console.error(error);
          } else {
            let html = gbk.toString('utf-8', body);
            let reg = /window\.open\('(.*)','\_self'\);/g
            let result = reg.exec(html);
            if (result != null && result[1]) {
              result = result[1];
              console.log('站点:' + site + ',集数:' + dates[j]['date'] + ',地址:' + result);
            }
          }
          resolve();
        });
      });
    }
    resolve();
  });
}