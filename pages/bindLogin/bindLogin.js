// pages/login/login.js

//获取应用实例
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
  },

  // /**
  //  * 微信用户快速绑定
  //  */
  // weBindTap:function(e){
  //   app.wxLogin();
  // },

  /**
   * 输入手机号快速绑定
   */
  phoneBindTap:function(e){
    wx.navigateTo({
      url: '/pages/bindPhone/bindPhone'
    })
  },

  /**把微信授权的用户信息放到全局当中 */
  getUserInfo: function (e) {
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo
    })
    wx.navigateBack({ delta: 1 })
  },

  // getPhoneNumber: function (e) {//点击获取手机号码按钮
  //   console.log(JSON.stringify(e))
  //   console.log(e.detail.errMsg)
  //   console.log(e.detail.iv)
  //   console.log(e.detail.encryptedData)


  //   wx.login({
  //     success: res => {
  //       // 发送 res.code 到后台换取 openId, sessionKey, unionId
  //       //微信登录获取code
  //       app.globalData.js_code = res.code
  //       //请求获取openid
  //       app.getOpenIdHttps(res.code, 0, function (isSuccess, resultData) {
  //         if (isSuccess) {
  //           var param = 'encrypted=' + e.detail.encryptedData + '&session_key=' + app.globalData.sessionKey + '&iv=' + e.detail.iv;
  //           wx.request({
  //             url: 'http://172.16.8.164/ylit_service/testEnWx/doAction',
  //             method: 'post',
  //             data: param,
  //             dataType: 'json',
  //             header: {
  //               // 'content-type': 'application/json;charset=utf-8'
  //               'content-type': 'application/x-www-form-urlencoded'
  //             },
  //             success: res => { 
  //               if (res.statusCode == 200) {
  //                 var resultData = res.data;
  //                 console.log(resultData.phone)
  //                  wx.showModal({
  //                   title: '获取手机号',
  //                    content: resultData.phone,
  //                   showCancel: false,
  //                 })
  //               }
                
  //             },
  //             fail: res => { },
  //           })
  //         }
  //       });
  //     },
  //     fail: res => {
  //       wx.hideLoading()
  //     }
  //   });

   
  // },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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