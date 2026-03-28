import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  ActivityIndicator,
  TouchableOpacity
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Colors } from '../theme/colors';
import { PublicService, IQuestionAnswer } from '../services/PublicService';
import { Ionicons } from '@expo/vector-icons';

export const QAScreen = () => {
  const { colors } = useTheme();
  const [qaList, setQaList] = useState<IQuestionAnswer[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchQA = async () => {
      try {
        const data = await PublicService.getAllQA();
        setQaList(data);
      } catch (err) {
        console.error('Error fetching QA:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchQA();
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>الأسئلة الشائعة</Text>
        
        {qaList.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="help-circle-outline" size={60} color={colors.textMuted} />
            <Text style={{ color: colors.textMuted, marginTop: 10 }}>لا توجد أسئلة شائعة حالياً.</Text>
          </View>
        ) : (
          qaList.map((item) => (
            <TouchableOpacity 
              key={item.id} 
              style={[styles.qaCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => toggleExpand(item.id)}
              activeOpacity={0.7}
            >
              <View style={styles.questionRow}>
                <Text style={[styles.question, { color: colors.text }]}>{item.question}</Text>
                <Ionicons 
                  name={expandedId === item.id ? "chevron-up" : "chevron-down"} 
                  size={20} 
                  color={Colors.primary} 
                />
              </View>
              {expandedId === item.id && (
                <View style={styles.answerContainer}>
                  <Text style={[styles.answer, { color: colors.text }]}>{item.answer}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'right' },
  qaCard: { 
    padding: 18, 
    borderRadius: 12, 
    borderWidth: 1, 
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1
  },
  questionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 },
  question: { fontSize: 16, fontWeight: '600', flex: 1, textAlign: 'right' },
  answerContainer: { marginTop: 15, paddingTop: 15, borderTopWidth: 0.5, borderTopColor: '#e2e8f0' },
  answer: { fontSize: 15, lineHeight: 24, textAlign: 'right' },
  empty: { alignItems: 'center', marginTop: 50 }
});
