// pages/addAddress/addAddress.js
const app = getApp();
var provincesChoose = '';//选择的省
var cityChoose = '';//选择的城市
var userId = '';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    pickerRegion: [], 
    userName:'',
    phone:'',
    address:'',
    addressDetail:'',
    addressCode:'',
    isDef:false
  },

  /**监听变化获取收货人 */
  bindInputUserName: function (e) {
    this.setData({
      userName:e.detail.detail.value
    });
  },

  /**监听变化获取收货人 */
  bindInputPhone: function (e) {
    this.setData({
      phone: e.detail.detail.value
    });
  },

  /**监听变化获取详细地址 */
  bindInputAddressDetail: function (e) {
    this.setData({
      addressDetail: e.detail.detail.value
    });
  },

  /**监听变化获取邮编 */
  bindInputAddressCode: function (e) {
    this.setData({
      addressCode: e.detail.detail.value
    });
  },


  /**
   * 弹出选择省、市、区联动列表
   */
  chooseAddressTap:function(e){
    var retAddress = e.detail.value;
    var tempAddress='';
    for (var index in retAddress){
      if (index == 0) {
        provincesChoose = retAddress[index];
      }
      if (index==1){
        cityChoose = retAddress[index];
      }
      tempAddress = tempAddress + retAddress[index];
    }
    this.setData({ address: tempAddress})
  },
 
  /**
   * 设置默认
   */
  setDefTab:function(e){
    var isDef = this.data.isDef;
    this.setData({
        isDef: !isDef
    });
  },

  /**
   * 保存
   */
  saveTap:function(e){
    var userName = this.data.userName;
    var phone = this.data.phone;
    var address = this.data.address;
    var addressDetail = this.data.addressDetail;
    var addressCode = this.data.addressCode;
     var isDef = this.data.isDef ? 1:0;
    if (userName == '' || userName == null || userName==undefined){
      wx.showModal({
        title: '提示',
        content: '请填写收货人',
        showCancel: false,
      });
    }
    else if (phone == '' || phone == null || phone == undefined){
      wx.showModal({
        title: '提示',
        content: '请填写联系电话',
        showCancel: false,
      });
    }
    else if (address == '' || address == null || address == undefined) {
      wx.showModal({
        title: '提示',
        content: '请选择所在地区',
        showCancel: false,
      });
    }
    else if (addressDetail == '' || addressDetail == null || addressDetail == undefined) {
      wx.showModal({
        title: '提示',
        content: '请填写详细地址',
        showCancel: false,
      });
    }
    else{
      var param={};
      param.clientId=userId;
      param.clientName = userName;
      param.clientPhone = phone;
      param.clientCity = provincesChoose+cityChoose;
      param.clientAddress = address + addressDetail;
      param.clientMailbox = addressCode;
      param.defaultFlag = isDef;
      wx.showLoading();
      app.httpsDataPost('/member/saveAddress', param,
        function (ret) {
          //成功
          if (ret.status) {
            wx.showModal({
              title: '提示',
              content: ret.msg,
              showCancel: false,
              success: res => { 
                wx.navigateBack({
                  delta: 1
                });
              }
            })
          } else {
            wx.showToast({ title: ret.msg + '(' + ret.code + ')', icon: 'none', duration: 2000 });
          }
        },
        function (ret) {
          //失败
          wx.hideLoading();
        });
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    userId = app.globalData.userId;
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