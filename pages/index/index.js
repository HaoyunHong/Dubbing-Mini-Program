//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    motto: '请允许我们获取您的头像和昵称\n点击头像进入游戏',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
  },
  //事件处理函数
  bindViewTap: function() {
      wx.navigateTo({
        url: '/pages/mainpage/mainpage'
      })
  },
  onLoad: function () {
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse){
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }
  },
  getUserInfo: function(e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
    console.log(e.detail.userInfo)
    app.globalData.nickName=e.detail.userInfo.nickName
    app.globalData.avatarUrl=e.detail.userInfo.avatarUrl
    console.log(app.globalData.nickName)
    console.log(app.globalData.avatarUrl)
    wx.getImageInfo({
      src: getApp().globalData.avatarUrl,
      success:function(res){
        getApp().globalData.localAvatarUrl=res.path
        console.log(getApp().globalData.localAvatarUrl)
      }
    })
    wx.getImageInfo({
      src: 'https://se-backend-se.app.secoder.net/api/image?name=mainpage_background',
      success:function(res){
        getApp().globalData.localBackground=res.path
      }
    })
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        var code = res.code; //返回code
        console.log(code);
        var appId = app.globalData.appId;
        var secret = app.globalData.appSecret;
        wx.request({
          url: 'https://se-backend-se.app.secoder.net/api/getOpenId',
          data: {
            appid:appId,
            secret:secret,
            js_code:code,
            grant_type:'authorization_code'
          },
          method:'GET',
          header: {
            'content-type': 'json'
          },
          success: function (res) {
            console.log(res);
            var openid = res.data.data.openid; //返回openid
            var sessionkey=res.data.data.session_key;
            var app=getApp();
            app.globalData.openId=openid;
            app.globalData.session_key=sessionkey;
            console.log('openid为' + openid);
            console.log('Sessionkey为' + sessionkey);
            wx.request({
              url:'https://se-backend-se.app.secoder.net/api/userSignUp',
              method:'POST',
              data:{
                user:openid,
                password:openid,
              },
              header: {
                'content-type': 'application/x-www-form-urlencoded'
              },
              success:function(res){
                console.log(res)
                if(res.data.code==200){
                  app.globalData.userId=res.data.data.id
                  console.log(app.globalData.userId)
                  app.uploadUserInfo()
                }
                else if(res.data.code==400&&res.data.data=="USER ALREADY EXISTS"){
                  console.log("userLogIn...")
                  wx.request({
                    url: 'https://se-backend-se.app.secoder.net/api/userLogIn',
                    method:'POST',
                    data:{
                      user:openid,
                      password:openid,
                    },
                    header: {
                      'content-type': 'application/x-www-form-urlencoded'
                    },
                    success:function(res){
                      if(res.data.code==200){
                        app.globalData.userId=res.data.data.id
                        console.log(app.globalData.userId)
                        app.uploadUserInfo()
                      }
                    }
                  })
                }
              },
              fail:function(res){
                console.log(res)
              }
            })
          }
        })
      }
    })
    getApp().uploadUserInfo()
    wx.navigateTo({
      url: '/pages/mainpage/mainpage',
    })
  }
})
