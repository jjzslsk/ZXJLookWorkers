// pages/postNote/postNote.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    type:'',

    pid:'',
    pname:'',
    id:'',
    name:'',

    cid:'',
    cname:'',
    wid:'',
    wname:'',
    workerClass:''
  },

  openClassDetail: function (e) {
    var type = this.data.type
    if (type == 'postByClass') {
      var pid = this.data.pid
      var pname = this.data.pname
      var id = this.data.id
      var name = this.data.name

      wx.navigateTo({
        url: '/pages/postStep/postStep?pid=' + pid + '&pname=' + pname + '&type=postByClass' + '&id=' + id + '&name=' + name + '&type=' + type
      })
    }else{
      var cid = this.data.cid
      var cname = this.data.cname
      var wid = this.data.wid
      var wname = this.data.wname
      var workerClass = this.data.workerClass

      wx.navigateTo({
        url: '/pages/postStep/postStep?id=' + cid + '&name=' + cname + '&type=postByClass' + '&workerId=' + wid + '&workerName=' + wname + '&type=' + type + '&workerClass=' + workerClass
      })
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var type = options.type

    if (type =='postByClass'){
      var pid = options.pid
      var pname = options.pname
      var id = options.id
      var name = options.name

      this.setData({
        pid: pid,
        pname:pname,
        id:id,
        name:name,
        type:type
      })
    }else{
      var cid = options.id
      var cname = options.name
      var wid = options.workerId
      var wname = options.workerName
      var workerClass = options.workerClass

      this.setData({
        cid: cid,
        cname: cname,
        wid: wid,
        wname: wname,
        type: type,
        workerClass: workerClass
      })
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})