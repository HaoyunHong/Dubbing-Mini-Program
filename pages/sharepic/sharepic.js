// pages/sharepic/sharepic.js
Page({
  onLoad(){
    this.setData({
      AvatarImg:getApp().globalData.localAvatarUrl,
      nickname:getApp().globalData.nickName
    })
    console.log(this.data.AvatarImg)
    console.log(this.data.nickname)
    console.log("loading")
    var that=this
    wx.getSystemInfo({
      success(res) {
          that.setData({
              windwo_w: res.windowWidth,
              window_h: res.windowHeight,
          })
      }
  })
    this.genpic()
  },
  genpic(){
    console.log("sharing")
    var that = this
    const ctx = wx.createCanvasContext('myCanvas'); 
    // 设置矩形边框
    ctx.setStrokeStyle('#fff')
    // 设置矩形宽高
    ctx.strokeRect(0, 0, 400, 200)
    let img = getApp().globalData.localBackground//图片路径不要出错
    ctx.drawImage(img, 0, 0, 400, 1000)
    ctx.save()
    ctx.drawImage(this.data.AvatarImg, 30, 30, 80, 80)               
    ctx.setFontSize(48)
    ctx.fillStyle = '#e0ae40';
    ctx.fillText(that.data.nickname, 120, 100,200)
    ctx.setFontSize(32)
    ctx.fillStyle = '#ffffff';
    ctx.fillText("在声音测试", 30, 170)
    var text1="Level "+getApp().globalData.level
    ctx.setFontSize(48)
    ctx.fillText(text1, 30, 235)
    ctx.setFontSize(32)
    ctx.fillText("获得了", 30, 285)
    ctx.setFontSize(48)
    ctx.fillText(parseInt(getApp().globalData.score[getApp().globalData.level-1]).toFixed(2), 30, 355)
    ctx.draw(false, function () {
    wx.canvasToTempFilePath({
      canvasId: 'myCanvas',
      success: function (res) {
        console.log(res.tempFilePath)
        // wx.previewImage({
        //   urls: [res.tempFilePath] // 需要预览的图片http链接列表
        // })
        that.setData({
          prurl: res.tempFilePath,
          hidden: false
        })
      },
      fail: res => {
        console.log(res);
      }
    })
  });
},

  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    hidden:true,
    prurl:"",
    localAvatarImg:"",
    AvatarImg:"",
    nickname:"",
    window_w:0,
    window_h:0
  },

  /**
   * 组件的方法列表
   */
    result(){
      this.setData({msg:"Listen Voice!"})
      wx.navigateTo({
        url:'../result/result',
      })
    },
    save(){
      console.log("saving")
      var that = this
      wx.saveImageToPhotosAlbum({
        filePath: that.data.prurl,
        success() {
          wx.showModal({
            content: '图片已保存到相册，赶紧晒一下吧~',
            showCancel: false,
            confirmText: '好的',
            confirmColor: '#333',
            success: function (res) {
              if (res.confirm) {
                console.log('用户点击确定');
                /* 该隐藏的隐藏 */
              }
            }
          })
        }
      })
    }
})
