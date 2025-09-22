import axiosConfig from '@utils/axiosConfig';

// Vietnam address data API
const PROVINCES_API = "https://provinces.open-api.vn/api";

class AddressService {
  // Get all provinces
  async getProvinces() {
    try {
      const response = await fetch(`${PROVINCES_API}/p/`);
      const data = await response.json();
      return {
        success: true,
        data: data.map(province => ({
          code: province.code,
          name: province.name,
          codename: province.codename
        }))
      };
    } catch (error) {
      console.error('Error fetching provinces:', error);
      return {
        success: false,
        message: 'Không thể tải danh sách tỉnh/thành phố',
        data: []
      };
    }
  }

  // Get districts by province code
  async getDistricts(provinceCode) {
    try {
      const response = await fetch(`${PROVINCES_API}/p/${provinceCode}?depth=2`);
      const data = await response.json();
      return {
        success: true,
        data: data.districts.map(district => ({
          code: district.code,
          name: district.name,
          codename: district.codename
        }))
      };
    } catch (error) {
      console.error('Error fetching districts:', error);
      return {
        success: false,
        message: 'Không thể tải danh sách quận/huyện',
        data: []
      };
    }
  }

  // Get wards by district code
  async getWards(districtCode) {
    try {
      const response = await fetch(`${PROVINCES_API}/d/${districtCode}?depth=2`);
      const data = await response.json();
      return {
        success: true,
        data: data.wards.map(ward => ({
          code: ward.code,
          name: ward.name,
          codename: ward.codename
        }))
      };
    } catch (error) {
      console.error('Error fetching wards:', error);
      return {
        success: false,
        message: 'Không thể tải danh sách phường/xã',
        data: []
      };
    }
  }

  // Get province name by code
  async getProvinceName(code) {
    try {
      const response = await fetch(`${PROVINCES_API}/p/${code}`);
      const data = await response.json();
      return data.name;
    } catch (error) {
      console.error('Error fetching province name:', error);
      return '';
    }
  }

  // Get district name by code
  async getDistrictName(code) {
    try {
      const response = await fetch(`${PROVINCES_API}/d/${code}`);
      const data = await response.json();
      return data.name;
    } catch (error) {
      console.error('Error fetching district name:', error);
      return '';
    }
  }

  // Get ward name by code
  async getWardName(code) {
    try {
      const response = await fetch(`${PROVINCES_API}/w/${code}`);
      const data = await response.json();
      return data.name;
    } catch (error) {
      console.error('Error fetching ward name:', error);
      return '';
    }
  }
}

export const addressService = new AddressService();