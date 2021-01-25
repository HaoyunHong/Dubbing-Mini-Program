// pages/mainpage/mainpage.js
Page({
onLoad:function(){
  console.log(getApp().globalData.localBackground)
  this.setData({mainpage_background:getApp().globalData.localBackground})
},

  data: {
    mainpage_background:'',
  },
  clicked: function(){
    this.setData({msg:"Watch Video"})
    wx.navigateTo({
      url:'../levels/levels',
    })
  },

  teach_clicked: function(){
    this.setData({msg:"teach"})
    wx.navigateTo({
      url:'../teach/teach',
    })
  },

  show_score:function(){
    console.log('showing user score...')
    wx.navigateTo({
      url: '../score/score',
    })
  }
})
