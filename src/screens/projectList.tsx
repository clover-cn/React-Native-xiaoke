import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
interface Project {
  id: string;
  name: string;
  description: string;
}

const ProjectList: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
 
  useEffect(() => {
    // Simulate fetching data
    fetchProjects();
  }, []);

  const fetchProjects = () => {
    // Placeholder for API call
    setTimeout(() => {
      const dummyData: Project[] = [
        { id: '1', name: 'Project A', description: 'This is project A' },
        { id: '2', name: 'Project B', description: 'This is project B' },
        { id: '3', name: 'Project C', description: 'This is project C' },
      ];
      setProjects(dummyData);
      setLoading(false);
    }, 1000);
  };

  const renderItem = ({ item }: { item: Project }) => (
    <TouchableOpacity style={styles.projectItem}>
      <Text style={styles.projectName}>{item.name}</Text>
      <Text style={styles.projectDescription}>{item.description}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity>
        <Text style={styles.header}>项目列表</Text>
      </TouchableOpacity>
      {loading ? (
        <View style={styles.loadingContainer}>
          <Text>Loading projects...</Text>
        </View>
      ) : (
        <FlatList
          data={projects}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
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
