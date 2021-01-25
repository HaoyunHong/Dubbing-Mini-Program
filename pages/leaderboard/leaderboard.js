// pages/leaderboard/leaderboard.js
Page({
  onLoad(e){
    this.data.listData.push({"code":"You","nickname":getApp().globalData.nickName,"AvatarUrl":getApp().globalData.localAvatarUrl,"score":"score:"+parseInt(getApp().globalData.score[getApp().globalData.level-1]).toFixed(2),"AudioUrl":'https://se-backend-se.app.secoder.net/api/voice?name='+getApp().globalData.openId + '_' +  String(getApp().globalData.level-1)})
    this.setData({listData:this.data.listData})
    var _this=this;
    wx.request({
      url: 'https://se-backend-se.app.secoder.net/api/getRecordsByLevel?level_name='+getApp().globalData.videoNames[e.level-1].level_name,
      method:'GET',
      success:function(res){
        console.log(getApp().globalData.videoNames[e.level-1].level_name)
        console.log(res)
        var count=0;
        for(var i=res.data.data.length-1;i>=0;i--){
          if(res.data.data[i].score<0) continue;
          var voice_name=res.data.data[i].voice_name
          console.log(voice_name)
            var end_of_openid=voice_name.lastIndexOf("_");
            console.log(end_of_openid)
            var player_openid=voice_name.substr(0,end_of_openid);
            console.log(player_openid)
            _this.data.listData.push({"code":"","nickname":"","AvatarUrl":"","score":"score:"+parseInt(res.data.data[i].score).toFixed(2),"AudioUrl":"https://se-backend-se.app.secoder.net/api/voice?name="+voice_name,"openId":player_openid})
            wx.request({
              url: 'https://se-backend-se.app.secoder.net/api/userInfo?user='+player_openid,
              method:'GET',
              success:function(res2){
                console.log(res2)
                for(var count=1;count<_this.data.listData.length;count++)
                  if(_this.data.listData[count].openId==res2.data.data.name) 
                    _this.data.listData[count]={"code":count,"nickname":res2.data.data.nickname,"AvatarUrl":res2.data.data.portrait,"score":_this.data.listData[count].score,"AudioUrl":_this.data.listData[count].AudioUrl}
                _this.setData({listData:_this.data.listData})
              }
            })
        }
        console.log(_this.data.listData)
      }
    })
  },
  data: {
    listData:[],
  },
  playAudio(e){
    var id=e.currentTarget.id
    var audioContext=wx.createAudioContext(id)
    if(id=="You") id='0'
    console.log(id)
    console.log(audioContext)
    console.log(this.data.listData[parseInt(id)])
    console.log(this.data.listData[parseInt(id)].AudioUrl)
    wx.downloadFile({
      url: this.data.listData[parseInt(id)].AudioUrl,
      success:function(res){
        console.log(res.tempFilePath)
        var destfile=wx.env.USER_DATA_PATH + '/'+new Date().getTime()+'_leaderboard_'+parseInt(id)+'_'+getApp().globalData.level+'.wav'
        wx.showLoading({title:"加载中"})
        function callback(){
          audioContext.setSrc(destfile)
          audioContext.play()
          wx.hideLoading()
        }
        getApp().addWaveHeader(res.tempFilePath,destfile,callback)
      }
    })
  }
})
