
Page({
  onLoad(e){
    console.log(e.level)
    var app=getApp()
    app.globalData.level=parseInt(e.level)
    this.setData({names:app.globalData.videoNames})
    console.log(this.data.names)
    this.setData({avatar_url:app.globalData.localAvatarUrl})
    this.setData({nickname:app.globalData.nickName})
    this.setData({video_url:'https://se-backend-se.app.secoder.net/api/video?name='+app.globalData.videoNames[e.level-1].video_name})
    this.setData({level:e.level})
    this.setData({level_name:app.globalData.videoNames[e.level-1].level_name})
  },
  showLeaderBoard:function(){
    var _this=this
    wx.navigateTo({
      url: '../leaderboard/leaderboard?level='+_this.data.level,
    })
  },
  onShareAppMessage() {
    return {
      title: '闯关',
      path: '/pages/component/pages/video'
    }
  },

  onReady() {
    this.videoContext = wx.createVideoContext('myVideo')
  },

  onHide() {

  },

  inputValue: '',
  data: {
    enableAutoRotation: true,
    src: '',
    video_url:'https://se-backend-se.app.secoder.net/api/video?name=',
    names:null,
    avatar_url:'',
    nickname:'',
    level:'',
    level_name:''
  },

  record: function(){
    this.setData({msg:"Record Voice!"})
    wx.navigateTo({
      url:'../voice/voice',
    })
  },

  listen: function(){
    this.setData({msg:"Listen Voice!"})
    wx.navigateTo({
      url:'../result/result',
    })
  },

  last(){
    var app=getApp();
    if(app.globalData.level>1) {
      app.globalData.level-=1;
      console.log(app.globalData.level)
      wx.reLaunch({
        url: '../video/video?level='+app.globalData.level,
      })
    }
    else{
      wx.showModal({
        title: '提示',
        content: '已经是第一关啦~',
        showCancel:false,
      })
    }
  },

  next(){
    var app=getApp();
    if(app.globalData.level<app.globalData.maxlevel) {
      app.globalData.level+=1;
      console.log(app.globalData.level)
      wx.reLaunch({
        url: '../video/video?level='+app.globalData.level,
      })
    }
    else{
      wx.showModal({
        title: '提示',
        content: '已经是最后一关啦~',
        showCancel:false,
      })
    }
  },
})
