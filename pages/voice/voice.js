const util = require('../../utils/util.js')
const app=getApp();

const UPLOAD_VOICE = "评测"

var playTimeInterval
var recordTimeInterval

var recorderManager = wx.getRecorderManager()
var innerAudioContext = wx.createInnerAudioContext("voice");

var fileManager = wx.getFileSystemManager();

var record_wav_path = wx.env.USER_DATA_PATH + '/record'+String(app.globalData.level-1)+'.wav';


Page({

  inputValue: '',

  data: {
    src: '',
    video_url:'https://se-backend-se.app.secoder.net/api/video?name=',
    names:null,
    avatar_url:'',
    nickname:'',

    recording: false,
    playing: false,
    hasRecord: false,
    recordTime: 0,
    playTime: 0,
    formatedRecordTime: '00:00:00',
    formatedPlayTime: '00:00:00',
    uploadVoice: UPLOAD_VOICE,
    hasUploaded: false,
    tempFilePath:'',
    wavFilePath:'',

    toView: 'green',
    triggered: false,

    lyric:'您看这个面\n它又长又宽\n就像这个碗\n它又大又圆\n你们来这里吃饭\n觉得饭很好吃\n我看行\n你们来这里吃饭\n就像我给你们拉面一样很开心'+'\n\n~END~',
  },

  onUnload: function() {
    recorderManager.stop();
    innerAudioContext.stop();
  },

  onHide() {
    if (this.data.playing) {
      this.stopVoice()
    } else if (this.data.recording) {
      this.stopRecordUnexpectedly()
    }
  },

  onLoad() {

    this.setData({names:app.globalData.videoNames})
    console.log(this.data.names)
    this.setData({avatar_url:app.globalData.localAvatarUrl})
    this.setData({nickname:app.globalData.nickName})
    this.setData({video_url:'https://se-backend-se.app.secoder.net/api/video?name='+app.globalData.videoNames[app.globalData.level-1].video_name})
    this.setData({lyric: app.globalData.videoNames[app.globalData.level-1].info})

    this.videoContext = wx.createVideoContext('myVideo'); 
    this.videoContext.pause();

    recorderManager = wx.getRecorderManager()
    innerAudioContext = wx.createInnerAudioContext();

    const that = this;
    
    this.setData({
      recording: false,
      playing: false,
      hasRecord: false,
      recordTime: 0,
      playTime: 0,
      formatedRecordTime: '00:00:00',
      formatedPlayTime: '00:00:00',
      uploadVoice: UPLOAD_VOICE,
      hasUploaded: false,
      first: true,
    })

    // 监听录音开始事件
    recorderManager.onStart(() => { 
      this.videoContext.seek(0);
      this.videoContext.play(); 
      console.log('recorderManage: onStart')
      // 录音时长记录 每秒刷新
      recordTimeInterval = setInterval(() => {
        const recordTime = that.data.recordTime +1
        that.setData({
          formatedRecordTime: util.formatTime(that.data.recordTime),
          recordTime: recordTime,
        })
      }, 1000)
    });

    // 监听录音停止事件
    recorderManager.onStop((res) => {
      this.videoContext.stop();
      console.log('recorderManage: onStop');
      console.log(res);
      // 清除录音计时器
      clearInterval(recordTimeInterval);
      that.setData({
        hasRecord: true, // 录音完毕
        recording: false,
        tempFilePath: res.tempFilePath,
        formatedPlayTime: util.formatTime(that.data.playTime),
      })
      var destfile=wx.env.USER_DATA_PATH + '/'+new Date().getTime()+'_'+getApp().globalData.openId+'_'+getApp().globalData.level+'.wav'
      // function callback(){
      //   that.setData({wavFilePath:destfile})
      // }
      that.setData({wavFilePath:destfile})
      if(this.data.first){
        wx.showLoading({title:"本地保存录音\n若长时间未完成，请重新录音"})
      }
      // 这里判断一下，如果成功回调，就hide，否则一定时间后弹窗重录
      function callback(){
        if(that.data.first){
          wx.hideLoading()
        }
        that.setData({
          first: false,
        })
      }
      if(app.addWaveHeader(res.tempFilePath,destfile, callback)==false){
        wx.hideLoading()
        wx.showToast({
          duration:3000,
          icon: 'none',
          title: "您的录音出现问题\r\n请重试",
        })
        this.clear()
      }

    });

    // 监听播放开始事件
    innerAudioContext.onPlay(() => {
      console.log('innerAudioContext: onPlay')
      console.log('that.data.playTime: '+that.data.playTime)
      console.log('that.data.recordTime: '+that.data.recordTime)

      playTimeInterval = setInterval(() => {
        const playTime = that.data.playTime + 1
        if(that.data.playTime == that.data.recordTime) {
          that.stopVoice();
        } else {
          that.setData({
            formatedPlayTime: util.formatTime(playTime),
            playTime: playTime
          })
        }
      }, 1000);
    });

    innerAudioContext.onStop(() => {
      
    })
  },

  bindButtonTap() {
    const that = this
    wx.chooseVideo({
      sourceType: ['album', 'camera'],
      maxDuration: 60,
      camera: ['front', 'back'],
      success(res) {
        that.setData({
          src: res.tempFilePath
        })
      }
    })
  },

  

  startRecord:function(e) {
    this.setData({ 
      recording: true // 录音开始
    })

    // 设置 Recorder 参数，这样从手机端上传录音的时候就可以进行识别
    const options = {
      duration: 20000, // 持续时长
      sampleRate: 16000, // 16k
      numberOfChannels: 1,
      encodeBitRate: 96000,
      format: 'PCM',
    }

    recorderManager.start(options) // 开始录音
  },
  

  stopRecord() {
    recorderManager.stop(); // 停止录音
    this.videoContext.stop();
    var that = this
    wx.saveFile({
      success: function(res) {
        that.setData({
          tempFilePath: res.savedFilePath,
          recording: false,
          playing: false,
          hasUploaded: false,
          hasRecord: true
        })
        console.log("onStop..")
        console.log("that.data.tempFilePath:"+that.data.tempFilePath)       
      }
    })
  },

  stopRecordUnexpectedly() {
    const that = this
    wx.stopRecord({
      success() {
        console.log('stop record success')
        clearInterval(recordTimeInterval)
        that.setData({
          recording: false,
          hasRecord: false,
          recordTime: 0,
          formatedRecordTime: util.formatTime(0)
        })
      }
    })
  },


  playVoice() {
    console.log("this.data.tempFilePath:"+this.data.tempFilePath)
    this.videoContext.seek(0); 
    this.videoContext.play();
    innerAudioContext.src = this.data.wavFilePath;
    this.setData({
      recording: false,
      playing: true,
      hasRecord: true,

    }, () => {
      innerAudioContext.play();

    })
    
  },

  stopVoice() { 
    clearInterval(playTimeInterval)
    innerAudioContext.stop();
    this.videoContext.stop();
    this.setData({
      hasRecord: true,
      playing: false,
      formatedPlayTime: util.formatTime(0),
      playTime: 0
    })
  
  },

  upper(e) {
    console.log(e)
  },

  lower(e) {
    console.log(e)
  },

  scroll(e) {
    console.log(e)
  },

  scrollToTop() {
    this.setAction({
      scrollTop: 0
    })
  },


  uploadVoice: function() {
      var that = this
      wx.showLoading({title:"评分中"})
      setTimeout(function () {
        wx.hideLoading()
      }, 2000)
      console.log(app.globalData.videoNames[app.globalData.level-1].name)
        wx.uploadFile({
          
          url: 'https://se-backend-se.app.secoder.net/api/uploadVoice',
          filePath : this.data.tempFilePath, 
          name: 'file',
          formData: {
            'type': 'user',
            'user': app.globalData.openId, 
            'id': app.globalData.userId,
            'videoname': app.globalData.videoNames[app.globalData.level-1].name,
            'filename': app.globalData.openId + '_' + String(app.globalData.level-1),
            'level_name': app.globalData.videoNames[app.globalData.level-1].level_name,
          },
          
          
          success: res => {
            console.log(res)
            // 如果没有有返回分数信息
            if(res.data.indexOf("score")<0 || JSON.parse(res.data).data.score==null){
              clearInterval(playTimeInterval)
              innerAudioContext.stop();  
              wx.showToast({
                duration:3000,
                icon: 'none',
                title: '打分失败\r\n音频或服务器异常\r\n请重试',
              })
              that.setData({
                recording: false,
                playing: false,
                hasUploaded: false,
              })
            }
            else{
              app.globalData.score[app.globalData.level-1] = JSON.parse(res.data).data.score
            console.log("app.globalData.score: " + app.globalData.score)

            console.log(app.globalData.openId + '_' + String(app.globalData.level-1))

            console.log("that.data.tempFilePath:"+that.data.tempFilePath)

            console.log('[上传文件] 成功：', res)

            // wx.showToast({
            //   icon: 'none',
            //   title: '上传成功',
            // })

            that.setData({
              hasUploaded: true,
              hasRecord: true
            })

            wx.navigateTo({
              url: '../sharepic/sharepic',
            })

            }           
          },
          fail: e => {
            console.log("that.data.tempFilePath:"+that.data.tempFilePath)
            console.error('[上传文件] 失败：', e)
            clearInterval(playTimeInterval)
            innerAudioContext.stop();  
            wx.showToast({
              icon: 'none',
              title: '上传失败\r\n服务器异常\r\n请重试',
            })
            that.setData({
              recording: false,
              playing: false,
              hasUploaded: false,
            })
          },
          // complete: () => {
          //   wx.hideLoading()
          // }
        })
        
        // that.setData({
        //   tempFilePath: res.savedFilePath,
        // })

        console.log("that.data.tempFilePath:"+that.data.tempFilePath)

  },

clear() {
  clearInterval(playTimeInterval)
  innerAudioContext.stop();  
  this.videoContext.stop();  
  this.setData({
    playing: false,
    hasRecord: false,
    tempFilePath: '',
    formatedRecordTime: util.formatTime(0),
    recordTime: 0,
    playTime: 0,
    hasUploaded: false,
    first: true,
  })
}
})