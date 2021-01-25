Page({
  onLoad(){
  },

  onShareAppMessage() {
    return {
      title: 'video',
      path: 'page/component/pages/video/video'
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
    receive:'  httpResponse  ',
    video_url:'https://se-backend-se.app.secoder.net/api/video?name=teach', // 这里是要改的
  },


  bindVideoEnterPictureInPicture() {
    console.log('进入小窗模式')
  },

  bindVideoLeavePictureInPicture() {
    console.log('退出小窗模式')
  },

  bindPlayVideo() {
    this.videoContext.play()
  },
})
