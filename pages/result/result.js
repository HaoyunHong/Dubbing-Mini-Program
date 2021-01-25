var app = getApp();
var manager = wx.createInnerAudioContext("result");

Page({
  onLoad(){
    this.setData({names:app.globalData.videoNames})
    console.log(this.data.names)
    this.setData({avatar_url:app.globalData.localAvatarUrl})
    this.setData({nickname:app.globalData.nickName})
    this.setData({video_url:'https://se-backend-se.app.secoder.net/api/video?name='+app.globalData.videoNames[app.globalData.level-1].video_name})
    this.setData({voice_url:'https://se-backend-se.app.secoder.net/api/voice?name='+getApp().globalData.openId + '_' +  String(getApp().globalData.level-1)})
    this.setData({score: "本关最新得分: "+parseInt(app.globalData.score[app.globalData.level-1]).toFixed(2)})
    console.log(app.globalData.level)

    this.videoContext = wx.createVideoContext('resultVideo'); 
    this.videoContext.pause();

    wx.downloadFile({
      url: this.data.voice_url,
      success:function(res){
        console.log("res.tempFilePath: " + res.tempFilePath)
        var destfile=wx.env.USER_DATA_PATH + '/'+new Date().getTime()+'_'+getApp().globalData.openId+'_'+getApp().globalData.level+'.wav'
        that.setData({destfile: destfile})
        wx.showLoading({title:"加载中"})
        function callback(){
          wx.hideLoading()
        }
        getApp().addWaveHeader(res.tempFilePath,destfile,callback)
      }
    })

    var that = this;

    manager.onPlay(function() {
      console.log("======onPlay======");

      that.videoContext.seek(0);
      that.videoContext.play(); 

      that.setData({
        playStatus: true,
        endStatus: false,     
      })
    });
    manager.onPause(function() {
      that.setData({
        playStatus: false,
        endStatus: false,
      })
      console.log("======onPause======");
    });

    var that = this;

    manager.onEnded(function() {

      console.log("======onEnded======");
   
      that.setData({
        endStatus: true,
        playStatus: false,
      })

      that.videoContext.stop()

    });

  },

  onReady() {
    
  },

  inputValue: '',
  data: {
    enableAutoRotation: true,
    src: '',
    video_url:'https://se-backend-se.app.secoder.net/api/video?name=',
    names:null,
    avatar_url:'',
    nickname:'',
    playStatus: false,
    endStatus: false,
    score: null,
    voice_url:'https://se-backend-se.app.secoder.net/api/voice?name=',
    destfile:'',
  },

  //播放按钮
  playOrpause: function() {
    var that = this;
    if(this.data.endStatus){
        that.setData({
          endStatus:false,
          playStatus:false,
        })
    }
    else{
      if (this.data.playStatus) {
        that.setData({
          endStatus:false,
          playStatus:false,
        })
        manager.pause();
        that.videoContext.pause();
      } else {
          that.setData({
            endStatus:false,
            playStatus:true,
          })
          manager.src = that.data.destfile
          manager.play()
          that.videoContext.play();        
      } 
    }      
  },

  handleTapShareButton() {
    if (!((typeof wx.canIUse === 'function') && wx.canIUse('button.open-type.share'))) {
      wx.showModal({
        title: '当前版本不支持转发按钮',
        content: '请升级至最新版本微信客户端',
        showCancel: false
      })
    }
  },

  // //格式化时长
  // formatTime: function(s) {
  //   let t = '';
  //   s = Math.floor(s);
  //   if (s > -1) {
  //     let min = Math.floor(s / 60) % 60;
  //     let sec = s % 60;
  //     if (min < 10) {
  //       t += "0";
  //     }
  //     t += min + ":";
  //     if (sec < 10) {
  //       t += "0";
  //     }
  //     t += sec;
  //   }
  //   return t;
  // },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {
    manager.stop();
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {
    manager.stop();
  },
})
