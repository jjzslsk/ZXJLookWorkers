// pages/search/search.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    keywords:'',
    classList:[],
    focus:false,
    searchList:[],
    nodata:'1' //1请输入关键字搜索，2搜索中，3无结果
  },

  onInputChange: function (e) {
    this.setData({
      keywords: e.detail.value
    })

  },

  searchInputFocus: function (e) {
    console.log('focus');
    this.setData({
      focus: true
    })
  },

  searchInputBlur: function (e) {
    console.log('searchInputBlur');
    this.setData({
      focus: false
    })
  },

  clearInput: function (e) {
    this.setData({
      keywords: ''
    })
  },

  openClassDetail: function (e) {
    var pid = e.currentTarget.dataset.pid
    var pname = e.currentTarget.dataset.pname
    var id = e.currentTarget.dataset.id
    var name = e.currentTarget.dataset.name
    wx.navigateTo({
      url: '/pages/postNote/postNote?pid=' + pid + '&pname=' + pname + '&type=postByClass' + '&id=' + id + '&name=' + name + '&type=postByClass'
    })
  },

  historySearch: function (e) {
    var text = e.currentTarget.dataset.text
    console.log('texttexttexttexttexttexttexttexttexttexttext::::'+text)
    this.setData({
      keywords: text
    })
    this.doSearch()
  },

  clearHistory: function (e) {
    try {
      wx.removeStorageSync('searchHistory')
      console.log('clearHistory')
    } catch (e) {
      // Do something when catch error
    }

    this.setData({
      searchList: []
    })
  },

  doSearch: function (e) {
    var keywords = this.data.keywords
    if (!keywords || keywords=='') {//判空
      wx.showToast({
        title: '请输入关键字',
        icon: 'none',
        duration: 2000
      })
      return
    }

    var searchList = this.data.searchList
    if (searchList.length>1){
      for (var i=0;i<searchList.length;i++){
        console.log(keywords + '::' + searchList[i])
        if (keywords == searchList[i]){        
          searchList.splice(i, 1);         
        }
      }
      searchList.unshift(keywords);
      if (searchList.length>10){
        searchList.splice(10, searchList.length);
      }
    }else{
      searchList.push(keywords);
    }

    wx.setStorage({
      key: "searchHistory",
      data: searchList
    })

    this.setData({
      searchList: searchList,
      nodata:'2'
    })


    var that = this;
    wx.showLoading({
      title: '加载中',
    })
    var param = 'searchText=' + keywords;
    console.log(param)
    //获取工种信息
    app.httpsDataGet('/worker/getWorkerTypeAll', param,
      function (res) {
        console.log('getWorkerTypeAll:' + JSON.stringify(res));
        var nodata=''
        for(var i=0;i<res.data.length;i++){
          if (res.data[i].child.length > 0)
            nodata = '3'
        }
        //成功
        that.setData({
          classList: res.data,
          nodata: nodata
        });

      },
      function (returnFrom, res) {
        //失败
        wx.hideLoading()
      }
    )
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that=this
    wx.getStorage({
      key: 'searchHistory',
      success(res) {
        console.log('searchHistory:' + JSON.stringify(res));
        that.setData({
          searchList: res.data
        });   
      }
    })
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