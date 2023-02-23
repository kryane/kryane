const AlipaySdk = require('alipay-sdk').default

const alipaySdk = new AlipaySdk({
    appId: '',              // 这里填写的是你的appId
    // 签名算法
    signType: 'RSA2',
    // 支付宝网关
    gateway: 'https://openapi.alipaydev.com/gateway.do',
    // 支付宝公钥
    alipayPublicKey: '',    // 这里填写的是你的alipayPublicKey
    // 应用私钥
    privateKey: '',         // 这里填写的是你的privateKey
});

module.exports = alipaySdk