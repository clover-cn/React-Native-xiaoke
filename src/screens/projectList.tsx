import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import apiService from '../services/api';
interface Project {
  projectId: string;
  groupName: string;
  projectName: string;
}

const ProjectList: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    projectList();
  }, []);

  
  // 获取项目列表
  const [projectListData, setProjectListData] = useState<Project[]>([]);
  const projectList = async () => {
    try {
      const res: any = await apiService.getDeviceList();
      console.log('获取项目列表', res);
      if (res.projects.length > 0) {
        console.log('开始设置当前项目为第一个:', res.projects[0]);
        setLoading(false);
        setProjectListData(res.projects);
      } else if (res.projects.length <= 0) {

        console.warn('项目为空');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const renderItem = ({ item }: { item: Project }) => (
    <TouchableOpacity style={styles.projectItem}>
      <Text style={styles.projectName}>{item.projectName}</Text>
      <Text style={styles.projectDescription}>{item.projectId}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* <TouchableOpacity>
        <Text style={styles.header}>项目列表</Text>
      </TouchableOpacity> */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <Text>Loading projects...</Text>
        </View>
      ) : (
        <FlatList
          data={projectListData}
          renderItem={renderItem}
          keyExtractor={item => item.projectId}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false} // 隐藏垂直滚动条
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  listContainer: {
    paddingBottom: 20,
  },
  projectItem: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  projectName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  projectDescription: {
    fontSize: 14,
    color: '#666',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ProjectList;
