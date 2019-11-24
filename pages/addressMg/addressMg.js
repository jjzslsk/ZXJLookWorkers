// pages/addressMg/addressMg.js
const app = getApp();
var userId = '';

Page({
  /**
   * 页面的初始数据
   */
  data: {
    action: 1, //页面来源：0默认，1来自选择页面
    addressList: [],
    chooseAddressCur: {
      id: '',
      userName: '',
      phone: '',
      address: '',
      cityName:'',
      postcode:''
    }
  },

  /**
   * 跳转添加地址页面
   */
  goAddAddress: function(e) {
    wx.navigateTo({
      url: '/pages/addAddress/addAddress'
    })
  },

  /**
   * 选择地址
   */
  chooseAddressTab: function(e) {
    var id = e.currentTarget.dataset.id;
    var position = e.currentTarget.dataset.index
    var addressTemp = this.data.addressList[position];
    this.setData({
      chooseAddressCur: {
        id: addressTemp.clientAddressId,
        userName: addressTemp.clientName,
        phone: addressTemp.clientPhone,
        address: addressTemp.clientAddress,
        cityName: addressTemp.clientCity,
        postcode: addressTemp.clientMailbox == undefined ? '' : addressTemp.clientMailbox
      }
    });
  },

  /**
   * 设置默认
   */
  setDefTap: function(e) {
    var that = this;
    var id = e.currentTarget.dataset.id;
    var position = e.currentTarget.dataset.index;
    var addressList = this.data.addressList;

    var param = 'clientId=' + userId + '&clientAddressId=' + id;
    wx.showLoading();
    app.httpsDataPost1('/member/setDefaultAddress', param,
      function(ret) {
        //成功
        for (var index in addressList) {
          if (position == index) {
            //设置默认
            addressList[index].defaultFlag = 1;
          } else {
            //其他取消默认
            addressList[index].defaultFlag = 0;
          }
        }
        that.setData({
          addressList: addressList
        });
      },
      function(ret) {
        //失败
        wx.hideLoading()
      }
    );

  },

  /**
   * 删除
   */
  delAddressTap: function(e) {
    var that = this;
    var id = e.currentTarget.dataset.id;
    var position = e.currentTarget.dataset.index;
    var addressList = this.data.addressList;

    wx.showModal({
      title: '提示',
      content: '确定要删除此地址吗?',
      success(res) {
        if (res.confirm) {
          var param = 'clientId=' + userId + '&clientAddressId=' + id;
          wx.showLoading();
          app.httpsDataPost1('/member/removeAddress', param,
            function(ret) {
              //成功
              addressList.splice(position, 1);
              that.setData({
                addressList: addressList
              });
            },
            function(ret) {
              //失败
              wx.hideLoading()
            }
          );
        } else if (res.cancel) {}
      }
    })

  },

  /**
   * 确定选择
   */
  confirmChoose: function(e) {
    if (this.data.action == 1) {
      var chooseAddressCur = this.data.chooseAddressCur;
      if (chooseAddressCur.id == null || chooseAddressCur.id == '') {
        wx.showModal({
          title: '提示',
          content: '尚未勾选任何地址',
          showCancel: false
        })
        return;
      }
      var pages = getCurrentPages();
      var prevPage = pages[pages.length - 2]; //上一个页面

      //直接调用上一个页面的setData()方法，把数据存到上一个页面中去
      prevPage.setData({
        addressInfo: {
          id: chooseAddressCur.id,
          takeName: chooseAddressCur.userName,
          takePhone: chooseAddressCur.phone,
          address: chooseAddressCur.address,
          cityName: chooseAddressCur.cityName,
          postcode: chooseAddressCur.postcode
        }
      });

      wx.navigateBack({
        delta: 1
      })
    }

  },

  //获取地址列表
  httpsDataList: function() {
    var that = this;
    var param = 'clientId=' + userId;
    app.httpsDataGet('/member/getAddressList', param,
      function(ret) {
        //成功
        that.setData({
          addressList: ret.data
        });
      },
      function(ret) {
        //失败
        wx.hideLoading()
      });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var action = options.action;
    this.setData({
      action: action,
    });
    userId = app.globalData.userId;
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    wx.showLoading();
    this.httpsDataList();
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})