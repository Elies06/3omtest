// // TimePicker.tsx
// import React, { useState } from 'react';
// import { View, Text, TouchableOpacity, StyleSheet, Modal, FlatList } from 'react-native';
// import { Clock } from 'lucide-react-native';

// /**
//  * Composant TimePicker - Sélecteur d'heures avec menu déroulant
//  */
// const TimePicker = ({
//   value,
//   onChange,
//   label,
//   disabled = false,
//   minTime = null
// }) => {
//   const [modalVisible, setModalVisible] = useState(false);
  
//   // Générer les options d'heures (8h à 23h par tranches de 30min)
//   const generateTimeOptions = () => {
//     const options = [];
//     for (let hour = 8; hour < 24; hour++) {
//       for (let minute of [0, 30]) {
//         // Filtrer si minTime est défini
//         if (minTime) {
//           const currentTime = new Date();
//           currentTime.setHours(hour, minute, 0, 0);
//           if (currentTime <= minTime) continue;
//         }
        
//         options.push({
//           hour,
//           minute,
//           label: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
//         });
//       }
//     }
//     return options;
//   };

//   const handleSelect = (hour, minute) => {
//     const newDate = new Date();
//     newDate.setHours(hour, minute, 0, 0);
//     onChange(newDate);
//     setModalVisible(false);
//   };

//   // Formatage de l'heure affichée
//   const displayTime = value 
//     ? `${value.getHours().toString().padStart(2, '0')}:${value.getMinutes().toString().padStart(2, '0')}`
//     : "Sélectionner";

//   return (
//     <View style={styles.container}>
//       <TouchableOpacity
//         style={[styles.button, disabled && styles.buttonDisabled]}
//         onPress={() => !disabled && setModalVisible(true)}
//         disabled={disabled}
//       >
//         <Clock size={18} color="#374151" />
//         <Text style={styles.buttonText}>{label}: {displayTime}</Text>
//       </TouchableOpacity>

//       <Modal
//         transparent={true}
//         visible={modalVisible}
//         animationType="fade"
//         onRequestClose={() => setModalVisible(false)}
//       >
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalContent}>
//             <Text style={styles.modalTitle}>Sélectionner l'heure</Text>
            
//             <FlatList
//               data={generateTimeOptions()}
//               renderItem={({ item }) => (
//                 <TouchableOpacity
//                   style={styles.timeOption}
//                   onPress={() => handleSelect(item.hour, item.minute)}
//                 >
//                   <Text style={styles.timeText}>{item.label}</Text>
//                 </TouchableOpacity>
//               )}
//               keyExtractor={(item, index) => `time-${index}`}
//               style={styles.timeList}
//             />
            
//             <TouchableOpacity 
//               style={styles.cancelButton}
//               onPress={() => setModalVisible(false)}
//             >
//               <Text style={styles.cancelButtonText}>Annuler</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </Modal>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   button: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 6,
//     paddingVertical: 10,
//     paddingHorizontal: 12,
//     borderWidth: 1,
//     borderColor: '#d1d5db',
//     borderRadius: 8,
//     backgroundColor: '#ffffff',
//     justifyContent: 'center',
//     minHeight: 44
//   },
//   buttonDisabled: {
//     opacity: 0.6,
//     backgroundColor: '#f3f4f6'
//   },
//   buttonText: {
//     fontFamily: 'Montserrat-SemiBold',
//     fontSize: 15,
//     color: '#374151'
//   },
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//     justifyContent: 'center',
//     alignItems: 'center'
//   },
//   modalContent: {
//     backgroundColor: '#ffffff',
//     borderRadius: 12,
//     width: '80%',
//     maxWidth: 300,
//     maxHeight: '70%',
//     padding: 16,
//     elevation: 5,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.25,
//     shadowRadius: 3.84
//   },
//   modalTitle: {
//     fontFamily: 'Montserrat-Bold',
//     fontSize: 18,
//     color: '#1e293b',
//     marginBottom: 16,
//     textAlign: 'center'
//   },
//   timeList: {
//     maxHeight: 300
//   },
//   timeOption: {
//     paddingVertical: 12,
//     paddingHorizontal: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: '#e5e7eb'
//   },
//   timeText: {
//     fontFamily: 'Montserrat-Regular',
//     fontSize: 16,
//     color: '#334155'
//   },
//   cancelButton: {
//     marginTop: 16,
//     paddingVertical: 12,
//     alignItems: 'center',
//     backgroundColor: '#f1f5f9',
//     borderRadius: 8
//   },
//   cancelButtonText: {
//     fontFamily: 'Montserrat-SemiBold',
//     fontSize: 16,
//     color: '#475569'
//   }
// });

// export default TimePicker;

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, FlatList } from 'react-native';
import { Clock } from 'lucide-react-native';
import { useFonts, Montserrat_600SemiBold, Montserrat_400Regular } from '@expo-google-fonts/montserrat';

/**
 * Composant TimePicker - Sélecteur d'heures avec menu déroulant
 * @param value - Heure actuellement sélectionnée
 * @param onChange - Fonction pour mettre à jour l'heure sélectionnée
 * @param label - Étiquette du sélecteur (ex: "Début", "Fin")
 * @param disabled - Désactiver le sélecteur
 * @param minTime - Heure minimale pour filtrer les options (pour "Fin")
 */
const TimePicker = ({
  value,
  onChange,
  label,
  disabled = false,
  minTime = null
}: {
  value: Date | null;
  onChange: (date: Date) => void;
  label: string;
  disabled?: boolean;
  minTime?: Date | null;
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  // Charger les polices
  const [fontsLoaded] = useFonts({
    'Montserrat-SemiBold': Montserrat_600SemiBold,
    'Montserrat-Regular': Montserrat_400Regular,
  });

  // Générer les options d'heures (8h à 23h45 par tranches de 15min)
  const generateTimeOptions = () => {
    const options = [];
    for (let hour = 8; hour < 24; hour++) {
      for (let minute of [0, 15, 30, 45]) {
        // Filtrer si minTime est défini (pour endTime)
        if (minTime) {
          const currentTime = new Date();
          currentTime.setHours(hour, minute, 0, 0);
          if (currentTime <= minTime) continue;
        }

        options.push({
          hour,
          minute,
          label: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        });
      }
    }
    console.log(`TimePicker (${label}) options generated:`, options);
    return options;
  };

  const timeOptions = generateTimeOptions();

  const handleSelect = (hour: number, minute: number) => {
    const newDate = new Date();
    newDate.setHours(hour, minute, 0, 0);
    console.log(`TimePicker (${label}) selected:`, newDate.toISOString());
    onChange(newDate);
    setModalVisible(false);
  };

  // Formatage de l'heure affichée
  const displayTime = value
    ? `${value.getHours().toString().padStart(2, '0')}:${value.getMinutes().toString().padStart(2, '0')}`
    : "Sélectionner";

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, disabled && styles.buttonDisabled]}
        onPress={() => !disabled && setModalVisible(true)}
        disabled={disabled}
      >
        <Clock size={18} color="#374151" />
        <Text style={styles.buttonText}>{label}: {displayTime}</Text>
      </TouchableOpacity>

      <Modal
        transparent={true}
        visible={modalVisible}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Sélectionner {label}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.closeButton}>Fermer</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={timeOptions}
              keyExtractor={(item) => `${item.hour}:${item.minute}`}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.timeOption}
                  onPress={() => handleSelect(item.hour, item.minute)}
                >
                  <Text style={styles.timeOptionText}>{item.label}</Text>
                </TouchableOpacity>
              )}
              showsVerticalScrollIndicator={true}
              style={styles.timeList}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

// --- Styles ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff',
    height: 48,
  },
  buttonDisabled: {
    backgroundColor: '#f1f5f9',
    opacity: 0.6,
  },
  buttonText: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 15,
    color: '#374151',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: '80%',
    maxHeight: '70%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalTitle: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 16,
    color: '#1e293b',
  },
  closeButton: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 14,
    color: '#0891b2',
  },
  timeList: {
    maxHeight: 300,
  },
  timeOption: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  timeOptionText: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 15,
    color: '#374151',
  },
});

export default TimePicker;