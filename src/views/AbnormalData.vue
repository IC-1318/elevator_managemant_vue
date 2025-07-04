<template>
  <div class="abnormal-data-container">
    <div class="filter-box">
      <el-form :inline="true" :model="filterForm" class="filter-form">
        <el-form-item label="故障类型">
          <el-select v-model="filterForm.systemName" placeholder="请选择故障类型" clearable>
            <el-option
              v-for="item in systemOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="filterForm.timeRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="yyyy-MM-dd"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleFilter">筛选</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="data-table">
      <el-table :data="tableData" border style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column prop="systemName" label="故障类型" />
        <el-table-column prop="systemSqName" label="子系统" />
        <el-table-column prop="eName" label="电梯名称" />
        <el-table-column prop="eData" label="数据值" />
      </el-table>
      
      <div class="pagination">
        <el-pagination
          background
          layout="prev, pager, next"
          :total="totalItems"
          :current-page="currentPage"
          :page-size="pageSize"
          @current-change="handlePageChange"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { abnormalDataApi } from '../api';

export default {
  name: 'AbnormalData',
  data() {
    return {
      filterForm: {
        systemName: '',
        timeRange: []
      },
      systemOptions: [
        { value: '曳引系统', label: '曳引系统' },
        { value: '门系统', label: '门系统' },
        { value: '电气控制系统', label: '电气控制系统' },
        { value: '导向系统', label: '导向系统' }
      ],
      tableData: [],
      loading: false,
      totalItems: 0,
      currentPage: 1,
      pageSize: 10
    }
  },
  created() {
    this.fetchData();
  },
  methods: {
    async fetchData() {
      this.loading = true;
      try {
        const params = {
          current: this.currentPage,
          size: this.pageSize
        };
        
        // 添加筛选条件
        if (this.filterForm.systemName) {
          params.systemName = this.filterForm.systemName;
        }
        
        const response = await abnormalDataApi.getAbnormalData(params);
        if (response.data.code === 200) {
          this.tableData = response.data.data.records;
          this.totalItems = response.data.data.total;
        } else {
          console.error('获取异常数据失败:', response.data.message);
        }
      } catch (error) {
        console.error('获取异常数据出错:', error);
      } finally {
        this.loading = false;
      }
    },
    handleFilter() {
      this.currentPage = 1; // 重置到第一页
      this.fetchData();
    },
    handlePageChange(page) {
      this.currentPage = page;
      this.fetchData();
    }
  }
}
</script>

<style scoped>
.abnormal-data-container {
  padding: 20px;
}
.filter-box {
  background: #fff;
  padding: 20px;
  margin-bottom: 20px;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}
.data-table {
  background: #fff;
  padding: 20px;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}
.pagination {
  margin-top: 20px;
  text-align: center;
}
</style>