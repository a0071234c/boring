/*
汽车签到
cron 43 7,21 * * * jd_car.js
const $ = new Env('汽车签到');
*/
const name = '汽车签到'
let UA
const $ = new Env('京东签到');
const notify = $.isNode() ? require('./sendNotify') : '';
//Node.js用户请在jdCookie.js处填写京东ck;
const jdCookieNode = $.isNode() ? require('./jdCookie.js') : '';
//IOS等用户直接用NobyDa的jd cookie
let cookiesArr = [], cookie = '', message = '', allMessage = '';
if ($.isNode()) {
  Object.keys(jdCookieNode).forEach((item) => {
    cookiesArr.push(jdCookieNode[item])
  })
  if (process.env.JD_DEBUG && process.env.JD_DEBUG === 'false') console.log = () => {};
  if (JSON.stringify(process.env).indexOf('GITHUB') > -1) process.exit(0)
} else {
  cookiesArr = [$.getdata('CookieJD'), $.getdata('CookieJD2'), ...jsonParse($.getdata('CookiesJD') || "[]").map(item => item.cookie)].filter(item => !!item);
}

function oc(fn, defaultVal) { //optioanl chaining
    try {
        return fn()
    } catch (e) {
        return undefined
    }
}

Object.keys(jdCookieNode).forEach((item) => {
    cookiesArr.push(jdCookieNode[item])
});
!(async () => {
    if (!cookiesArr[0]) {
        console.error('No CK found')
        return
    }
    for (let i = 0; i < cookiesArr.length; i++) {
        if (cookiesArr[i]) {
            cookie = cookiesArr[i]
            const UserName = decodeURIComponent(cookie.match(/pt_pin=([^; ]+)(?=;?)/) && cookie.match(/pt_pin=([^; ]+)(?=;?)/)[1]);
            console.log(`\n******开始【京东账号${i + 1}】${UserName}*********\n`);
            UA = process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./zero205_JD_tencent_scf_main/USER_AGENTS').USER_AGENT)
            await main()
        }
        if (i != cookiesArr.length - 1) {
            await wait(3000)
        }
    }

})()
.catch((e) => {
        console.error(`${name} 错误 :${e.stack}`)
    })
    .finally(() => {
        console.log(`${name} finish`)
    })

function wait(time) {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve()
        }, time)
    })
}

async function main() {
    await signBeanIndex()
    await wait(3000)
}

async function signBeanIndex() {
    const options = {
        url: `https://api.m.jd.com/client.action`,
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            'Host': `api.m.jd.com`,
            'Origin': 'https://api.m.jd.com',
            'Referer': `https://api.m.jd.com`,
            'Cookie': cookie
        },
        body: "functionId=signBeanIndex&appid=ld"
    }
    const { body } = await got.post(options)
    const data = JSON.parse(body)

    let title = oc(() => data.data.dailyAward.title) || oc(() => data.data.continuityAward.title)
    let bean = oc(() => data.data.dailyAward.beanAward.beanCount) || oc(() => data.data.continuityAward.beanAward.beanCount)
    if (bean) {
        console.log(`${title} 获得${bean}京豆`)
    }
}
