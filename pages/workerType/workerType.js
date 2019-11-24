// pages/workerType/workerType.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    classList:[],
    firstClassList: [], //一级分类(左边分类)
    secondClassList: [], //二级分类
    curFirstClass: {
      index:0
    }
  },

  rightItemTap: function (e) {
    var id = e.currentTarget.dataset.id;

    var list = this.data.secondClassList
    var pickedClassList=[]
    var index=0;
    for (var i = 0; i < list.length;i++){
      if (list[i].CLIENT_CLASS_ID==id){
        pickedClassList.unshift(list[i]);
      }else{
        pickedClassList.push(list[i]);
      }
    }

    // wx.setStorage({
    //   key: 'pickedClassList',
    //   data: pickedClassList
    // })
    wx.setStorageSync('pickedClassList', pickedClassList)
    wx.navigateBack({
      delta: 1
    })
  },

  switchClass: function (e) {		
    var index = e.currentTarget.dataset.index;		
    if (this.data.curFirstClass.index == index) return; //防止重复请求 
    this.setData({
      secondClassList: this.data.firstClassList[index].child,
      curFirstClass: {
        index: index
      },
    })   
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var than = this;
    wx.showLoading({
      title: '加载中',
    })
    var param = ''; 
    app.httpsDataGet('/worker/getWorkerTypeAll', param,
      function (res) {
        //console.log('getWorkerTypeAll:' + JSON.stringify(res));			
        //成功
        than.setData({
          firstClassList: res.data,
          secondClassList: res.data[0].child,
        });

      },
      function (returnFrom, res) {
        //失败
        wx.hideLoading()
        than.setData({
          footerHintLeft: '加载失败,请检查网络!',
          footerHintRight: '加载失败,请检查网络!'
        });
      }
    )
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