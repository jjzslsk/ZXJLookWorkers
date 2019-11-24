// pages/marketInfo/marketInfo.js
var WxParse = require('../../utils/wxParse/wxParse.js');
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    content:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var orgId = options.orgId
    var city = options.city
    wx.setNavigationBarTitle({
      title: '工种报价参考（' + city+'）'
    })
    var param = "ORG_ID=" + orgId
    var that = this;
    wx.showLoading();
    app.httpsGetDatByPlatform('quotataion_info', 'list', param,
      function (res) {;
        if (res.msg.length>0){
          // that.setData({ 
          //   content: res.msg[0].QUOTATION_NOTES
          // })
          WxParse.wxParse('article', 'html', res.msg[0].QUOTATION_NOTES, that, 5);
        }
      },
      function (returnFrom, res) {
        //失败
        wx.hideLoading();
      }
    );
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