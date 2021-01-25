// pages/levels/levels.js
Page({
  /**
   * 组件的属性列表
   */
  onLoad(){
    var _this=this
    _this.steps = []
    _this.steps.push({'code': 1, 'text': '配音与评分', 'video_url': 'https://se-backend-se.app.secoder.net/api/video?name=voice'})
    _this.steps.push({'code': 2, 'text': '观看与分享作品', 'video_url': 'https://se-backend-se.app.secoder.net/api/video?name=result'})
    _this.steps.push({'code': 3,'text': '用户排行榜', 'video_url': 'https://se-backend-se.app.secoder.net/api/video?name=leaderbord'})
    _this.steps.push({'code': 4,'text': '明星匹配度', 'video_url': 'https://se-backend-se.app.secoder.net/api/video?name=score'})

    this.setData({steps:_this.steps})
    console.log(this.data.steps)
  },

  data: {
    steps:[],
    currVideoId:null
  },

  openVideo:function(event){
    console.log(event.currentTarget.dataset.step)
    // 这里肯定也是要改的
    wx.navigateTo({
      url: '../teach_one_step/teach_one_step',
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
