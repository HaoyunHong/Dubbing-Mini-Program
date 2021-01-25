// pages/leaderboard/leaderboard.js
Page({
  onLoad(e){
    var app=getApp()
    var listData = []
    var original_listData = []
    for(var i=0;i<app.globalData.maxlevel;i++){
      listData.push({"code":i,"level":getApp().globalData.videoNames[i].level_name,"score":"score:"+parseInt(getApp().globalData.score[i]).toFixed(2),"numScore":parseInt(getApp().globalData.score[i]).toFixed(2),"AudioUrl":'https://se-backend-se.app.secoder.net/api/voice?name='+getApp().globalData.openId + '_' +  String(i)})

      // 先把排序之前的存下来
      original_listData.push({"code":i,"level":getApp().globalData.videoNames[i].level_name,"score":"score:"+parseInt(getApp().globalData.score[i]).toFixed(2),"numScore":parseInt(getApp().globalData.score[i]).toFixed(2),"AudioUrl":'https://se-backend-se.app.secoder.net/api/voice?name='+getApp().globalData.openId + '_' +  String(i)})

    }

    this.setData({original_listData:original_listData})

    function cmp(a,b){
      return b.numScore-a.numScore;
    }
    listData.sort(cmp)
    this.setData({listData:listData})
  },
  data: {
    original_listData:[],
    listData:[],
  },
  playAudio(e){
    console.log("e.currentTarget.id: "+e.currentTarget.id)
    var id=e.currentTarget.id
    var audioContext=wx.createAudioContext(id)
    console.log(id)
    console.log(audioContext)
    console.log(this.data.original_listData[parseInt(id)])
    if(parseInt(this.data.original_listData[parseInt(id)].numScore)==0){
      wx.showToast({
                  duration:3000,
                  icon: 'none',
                  title: "您还没有该部分录音",
                })
    }
    else{
      wx.downloadFile({
        url: this.data.original_listData[parseInt(id)].AudioUrl,
        success:function(res){
          console.log(res.tempFilePath)
          var destfile=wx.env.USER_DATA_PATH + '/'+new Date().getTime()+'_score_'+parseInt(id)+'.wav'
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
  }
})
