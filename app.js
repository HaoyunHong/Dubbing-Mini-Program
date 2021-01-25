//app.js
App({
  onLaunch: function () {
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
    var _this=this
    // 登录
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.login({
            success: res => {
              // 发送 res.code 到后台换取 openId, sessionKey, unionId
              var code = res.code; //返回code
              console.log(code);
              var appId = this.globalData.appId;
              var secret = this.globalData.appSecret;
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
                        _this.uploadUserInfo()
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
                              _this.uploadUserInfo()
                              wx.navigateTo({
                                url: '/pages/mainpage/mainpage',
                              })
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
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo
              this.globalData.nickName=res.userInfo.nickName
              this.globalData.avatarUrl=res.userInfo.avatarUrl
              console.log(res.userInfo)
              console.log(res.userInfo.nickName)
              console.log(res.userInfo.avatarUrl)
              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
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
              this.uploadUserInfo()
            }
          })
        }
      }
    })
  },
  uploadUserInfo:function(){
    var app=getApp()
    wx.request({
      url: 'https://se-backend-se.app.secoder.net/api/uploadUserInfo',
      method:'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data:{
        user:app.globalData.openId,
        id:app.globalData.userId,
        portrait:app.globalData.avatarUrl,
        nickname:app.globalData.nickName,
      },
      success:function(res){
        console.log(res)
        wx.request({
          url: 'https://se-backend-se.app.secoder.net/api/getLevelList',
          method: 'GET',
          success: function(res){
            // success
            var app=getApp()
            app.globalData.videoNames=res.data.data
            console.log(res)
            app.globalData.maxlevel=res.data.data.length
            console.log(app.globalData.maxlevel)
            for(var i=0;i<app.globalData.maxlevel;i++){
              app.globalData.score.push('0')
            }
            wx.request({
              url: 'https://se-backend-se.app.secoder.net/api/getRecordsByUser?user='+getApp().globalData.openId,
              method:'GET',
              success:function(res){
                console.log(res)
                for(var i=0;i<res.data.data.length;i++){
                  var levelname=res.data.data[i].level_name
                  for(var j=0;j<app.globalData.maxlevel;j++){
                    if(app.globalData.videoNames[j].level_name==levelname)
                      app.globalData.score[j]=res.data.data[i].score
                  }
                }
              }
            })
          }
        })
      },
    })
  },
  // 音频处理函数
  addWaveHeader:function(filepath,destfilepath,callback){
    console.log("adding waveHeader")
    console.log(filepath)
    console.log(destfilepath)
    let fsm=wx.getFileSystemManager()
    fsm.readFile({
      filePath:filepath,
      success:function(res){
        let samples=res.data
        console.log("samples.byteLength: "+samples.byteLength)
        var dataLength=samples.byteLength
        if(samples.byteLength%2==1){
          samples = samples.slice(0,-1)
          dataLength = samples.byteLength - 1
        } 
        console.log("dataLength: "+dataLength)
        var buffer=new ArrayBuffer(44+dataLength)
        var view=new DataView(buffer)
        var sampleRateTmp=16000
        var sampleBits=16
        var channelCount=1

        function writeString(_view, _offset, string){
          for (var i = 0; i < string.length; i++){
              _view.setUint8(_offset + i, string.charCodeAt(i));
          }
        }
        var offset = 0;
        /* 资源交换文件标识符 */
        writeString(view, offset, 'RIFF'); offset += 4;
        /* 下个地址开始到文件尾总字节数,即文件大小-8 */
        view.setUint32(offset, /*32*/ 36 + dataLength, true); offset += 4;
        /* WAV文件标志 */
        writeString(view, offset, 'WAVE'); offset += 4;
        /* 波形格式标志 */
        writeString(view, offset, 'fmt '); offset += 4;
        /* 过滤字节,一般为 0x10 = 16 */
        view.setUint32(offset, 16, true); offset += 4;
        /* 格式类别 (PCM形式采样数据) */
        view.setUint16(offset, 1, true); offset += 2;
        /* 通道数 */
        view.setUint16(offset, channelCount, true); offset += 2;
        /* 采样率,每秒样本数,表示每个通道的播放速度 */
        view.setUint32(offset, sampleRateTmp, true); offset += 4;
        /* 波形数据传输率 (每秒平均字节数) 通道数×每秒数据位数×每样本数据位/8 */
        view.setUint32(offset, sampleRateTmp * channelCount * (sampleBits / 8), true); offset +=4;
        /* 快数据调整数 采样一次占用字节数 通道数×每样本的数据位数/8 */
        view.setUint16(offset, channelCount * (sampleBits / 8), true); offset += 2;
        /* 每样本数据位数 */
        view.setUint16(offset, sampleBits, true); offset += 2;
        /* 数据标识符 */
        writeString(view, offset, 'data'); offset += 4;
        /* 采样数据总数,即数据总大小-44 */
        view.setUint32(offset, dataLength, true);
        function floatTo16BitPCM(output, _offset, input){
            console.log("before")
            input = new Int16Array(input);
            console.log("after input.length: "+input.length)
            for (var i = 0; i < input.length; i++, _offset+=2){
                output.setInt16(_offset,input[i],true);
            }
        }
        if(sampleBits == 16){
            floatTo16BitPCM(view, 44, samples);
        }else if(sampleBits == 8){
            floatTo8BitPCM(view, 44, samples);
        }else{
            floatTo32BitPCM(view, 44, samples);
        }

        console.log(view.buffer.byteLength)
        fsm.writeFile({
          filePath:destfilepath,
          data:view.buffer,
          success:function(res0){
            console.log(res0)
            callback();
            return true;
          },
          fail:function(res0){
            console.log(res0)
          }
        })
      },
      fail:function(res0){
        console.log(res0)
      }
    })
  },

  globalData: {
    videoNames:[],
    localAvatarUrl:'',
    localBackground:'',
    userInfo: null,
    appId:'wx23472eefc1419d4e',
    appSecret:'0f3e38500676539348cb250e684f81df',
    userId:'',
    nickName:'',
    avatarUrl:'',
    openId:'',
    session_key:'',
    level:1,
    maxlevel:1,
    score:[]
  }
})