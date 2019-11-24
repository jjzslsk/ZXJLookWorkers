// pages/chooseLocation/chooseLocation.js
const app = getApp();
var cities =[];
var jsonData = require('../../data/area.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    searchFocus:false,
    cur:'cur',
    loc:'loc',
    hot:'hot',
    curAddressCode: '',//当前
    curAddressName: '',
    locationCode: '261',//定位
    locationName: '南宁',
    locationIsOpen:false,
    rtAddressCode: '',//最近
    rtAddressName: '',
    rtAddressIsOpen: false,
    hotCities: [],//热门城市
    toView: 'A',
    cities: [],
    searchKey:''
  },

  /**模糊检索列表 */
  filterSearch: function (_search){
    var reg = new RegExp(_search, 'ig');
    var citiesTemp = cities;
    //es6 filter过滤匹配，有则返回当前，无则返回所有
    return citiesTemp.filter(function (e) {
      //匹配所有字段
      //return Object.keys(e).some(function(key) {
      //   return e[key].match(reg);
      //})
      //匹配某个字段
      return e.name.match(reg);
    })
  },

  /**监听搜索框的输入焦点焦点 */
  searchInputFocus: function (e) { },

  /**监听搜索框的失去焦点 */
  searchBlurFocus: function (e) { },

  /**监听搜索框输入内容 */
  searchKeyInput: function (e) {
    var _search = e.detail.value.trim();
    var citiesObj;
    if (_search) {
      //不区分大小写处理
      citiesObj = this.filterSearch(_search);
    }else{
      citiesObj = cities;
    }
    this.refreshData(citiesObj,_search);
  },

  /**
   * 选择地址
   */
  itemAddressTap: function (e) {
    var locationObj= e.currentTarget.dataset;
    var code = locationObj.code;
    var name = locationObj.name;

    this.setData({
      curAddressCode: code,
      curAddressName: name,
    })

    wx.setStorage({
      key: "location_record",
      data: JSON.stringify(locationObj)
    })

    var pages = getCurrentPages();
    var prevPage = pages[pages.length - 2]; //上一个页面

    if (prevPage.data.orgId!=code){
      //直接调用上一个页面的setData()方法，把数据存到上一个页面中去
      prevPage.setData({
        orgId: code,
        locationName: name,
      });
      wx.setStorageSync('curCityId', code)

      prevPage.getActivityList();
    }
    wx.navigateBack({ delta: 1 })
  },

  /**
   * 点击右边字母赛选
   */
  onChange(e) {
    var pinyin = e.detail.current;
      this.setData({
        toView: pinyin
      });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var than = this;
    wx.getStorage({
      key: 'location_record',
      success(res) {
        var locationObj = JSON.parse(res.data);
        var code = locationObj.code;
        var name = locationObj.name;
        var isopen = locationObj.isopen;
        than.setData({
          rtAddressCode: code,//最近
          rtAddressName: name,
          rtAddressIsOpen: isopen
        });
      }
    })

    var addressObj = jsonData.data;
    cities = addressObj.citieList;
    this.setData({
      curAddressCode: options.locationCode,//当前
      curAddressName: options.locationName,
      locationIsOpen: true,
      hotCities: addressObj.hotCitieList
    })
  },


  refreshData: function (citiesObj,searchKeyStr){
    var cur = this.data.cur;
    var loc = this.data.loc;
    var hot = this.data.hot;
    let storeCity = new Array(29);
    const words = [cur, loc, hot, "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"]
    words.forEach((item, index) => {
      storeCity[index] = {
        key: item,
        list: []
      }
    })
    citiesObj.forEach((item) => {
      let firstName = item.pinyin.substring(0, 1);
      let index = words.indexOf(firstName);
      storeCity[index].list.push({
        code: item.code,
        name: item.name,
        key: firstName,
        isOpen: item.isOpen
      });
    })
    this.data.cities = storeCity;
    this.setData({
      cities: this.data.cities,
      searchKey: searchKeyStr
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    this.refreshData(cities,'');
    // var cur = this.data.cur;
    // var loc = this.data.loc;
    // var hot = this.data.hot;
    // let storeCity = new Array(26);
    // const words = [cur,loc,hot,"A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"]
    // words.forEach((item, index) => {
    //   storeCity[index] = {
    //     key: item,
    //     list: []
    //   }
    // })
    // cities.forEach((item) => {
    //   let firstName = item.pinyin.substring(0, 1);
    //   let index = words.indexOf(firstName);
    //   storeCity[index].list.push({
    //     code: item.code,
    //     name: item.name,
    //     key: firstName
    //   });
    // })
    // this.data.cities = storeCity;
    // this.setData({
    //   cities: this.data.cities
    // })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

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