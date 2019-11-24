// pages/chatMessage/chatMessage.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    msgDataList: []
  },

  /**item点击事件 */
  msgItemTap: function (e) {
    var position = e.currentTarget.dataset.position;
    var obj = e.currentTarget.dataset.obj;
    var unreadCount = "msgDataList[" + position + "].otherPayInfo.unreadCount";
    //修改选择状态
    this.setData({
      [unreadCount]: 0
    });
    var orderId = obj.orderId == undefined ? '' : obj.orderId;
    var otherPayId = obj.otherPayId;
    var otherPayName = obj.otherPayName;
    var avatar = obj.avatar == undefined ? '' : obj.avatar;
    app.upChatUnreadCount(otherPayId);
    var param = 'orderId=' + orderId + '&otherPayId=' + otherPayId + '&otherPayName=' + otherPayName + '&otherPayAva=' + avatar;
    wx.navigateTo({
      url: '/pages/chat/chat?' + param
    })
  },

  refreshData: function () {
    var that = this;
    //第一次加载的时候刷新数据
    var chatMsgList = app.readChatMsgList();
    console.log('chatMsgList:' + JSON.stringify(chatMsgList));
    that.setData({
      msgDataList: chatMsgList
    });
    //获取监听，之后有信息发过来执行数据刷新
    app.getOnchatMsgCal(function () {
      var chatMsgList = app.readChatMsgList();
      that.setData({
        msgDataList: chatMsgList
      });
    });
  },

  onListLongpress: function (e) {
    var id = e.currentTarget.dataset.id;
    var name = e.currentTarget.dataset.name;
    var key = app.globalData.userId + '_chat_' + id
    var that=this

    wx.showModal({
      title: '提示',
      content: '确认删除与'+name+'的会话吗？',
      success(res) {
        if (res.confirm) {
          wx.removeStorage({
            key: key,
            success(res) {
              that.refreshData();
            }
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })    
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    if (app.globalData.userInfo == undefined || app.globalData.userInfo == null || app.globalData.userInfo == '') {
      app.wxLogin().then(function (res) {
        that.refreshData();
      })
    } else {
      that.refreshData();
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