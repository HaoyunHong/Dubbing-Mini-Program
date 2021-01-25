// pages/levels/levels.js
Page({
  /**
   * 组件的属性列表
   */
  onLoad(){
    wx.showLoading({title:"关卡加载中"})
      setTimeout(function () {
        wx.hideLoading()
      }, 2000)
    var maxlevel=getApp().globalData.maxlevel
    var _this=this
    for(var i=1;i<=maxlevel;i++){
      var url='https://se-backend-se.app.secoder.net/api/image?name='+getApp().globalData.videoNames[i-1].image_name
      var text=getApp().globalData.videoNames[i-1].level_name
      _this.data.levels.push({"code":i,"image_url":url,'text':text})
      _this.setData({levels:_this.data.levels})
    }
    _this.setData({levels:_this.data.levels})
    console.log(_this.data.levels)
  },

  data: {
    levels:[],
    message:"测试",
    currVideoId:null
  },

  openVideo:function(event){
    console.log(event.currentTarget.dataset.level)
    wx.navigateTo({
      url: '../video/video?level='+event.currentTarget.dataset.level,
    })
  },

  videoPlay:function(e){
    var oldId=this.data.currVideoId
    var newId=e.currentTarget.id
    console.log(e.currentTarget)
    console.log(oldId)
    console.log(newId)
    if(oldId!=null&&oldId!=newId){
      var oldVideoContext=wx.createVideoContext(oldId)
      oldVideoContext.stop()
    }
    if(oldId!=newId){
      var newVideoContext=wx.createVideoContext(newId)
      newVideoContext.play()
      this.setData({currVideoId:newId})
    }
  }
})
