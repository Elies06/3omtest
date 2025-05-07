
// // import React, { useState, useEffect } from 'react';
// // import {
// //     View,
// //     Text,
// //     StyleSheet,
// //     ScrollView,
// //     TouchableOpacity,
// //     TextInput,
// //     Platform,
// //     ActivityIndicator,
// //     Image,
// //     Alert,
// //     SafeAreaView,
// // } from 'react-native';
// // import {
// //     useFonts,
// //     Montserrat_700Bold,
// //     Montserrat_600SemiBold,
// //     Montserrat_400Regular,
// // } from '@expo-google-fonts/montserrat';
// // import {
// //     ChevronLeft,
// //     CreditCard as Card,
// //     Import as Passport,
// //     CheckCircle,
// //     UploadCloud,
// //     Info,
// // } from 'lucide-react-native';
// // import { router, SplashScreen, Stack } from 'expo-router';
// // import { supabase } from '@/lib/supabase';
// // import { useAuth } from '@/hooks/useAuth';
// // import Animated, { FadeIn } from 'react-native-reanimated';
// // import * as ImagePicker from 'expo-image-picker';
// // import * as FileSystem from 'expo-file-system';
// // import { Buffer } from 'buffer';

// // // Polyfill for atob if needed
// // global.atob = global.atob || ((data) => {
// //     return Buffer.from(data, 'base64').toString('binary');
// // });

// // type ImagePickerAsset = ImagePicker.ImagePickerAsset;

// // SplashScreen.preventAutoHideAsync();

// // type DocumentType = 'cin' | 'passport';

// // export default function VerifyIdentityScreen() {
// //     const { user } = useAuth();
// //     const [documentType, setDocumentType] = useState<DocumentType>('cin');
// //     const [documentNumber, setDocumentNumber] = useState('');
// //     const [selectedFileFront, setSelectedFileFront] = useState<ImagePickerAsset | null>(null);
// //     const [selectedFileBack, setSelectedFileBack] = useState<ImagePickerAsset | null>(null);
// //     const [selectedFaceFile, setSelectedFaceFile] = useState<ImagePickerAsset | null>(null);
// //     const [loading, setLoading] = useState(false);
// //     const [error, setError] = useState<string | null>(null);
// //     const [uploadProgress, setUploadProgress] = useState<number>(0);

// //     const [fontsLoaded, fontError] = useFonts({
// //         'Montserrat-Bold': Montserrat_700Bold,
// //         'Montserrat-SemiBold': Montserrat_600SemiBold,
// //         'Montserrat-Regular': Montserrat_400Regular,
// //     });

// //     useEffect(() => {
// //         if (fontsLoaded || fontError) {
// //             SplashScreen.hideAsync();
// //         }
// //     }, [fontsLoaded, fontError]);

// //     if (!fontsLoaded && !fontError) {
// //         return (
// //             <SafeAreaView style={styles.loadingContainer}>
// //                 <ActivityIndicator size="large" color="#0891b2" />
// //             </SafeAreaView>
// //         );
// //     }
// //     if (fontError) {
// //         return (
// //             <SafeAreaView style={styles.loadingContainer}>
// //                 <Text style={styles.errorText}>Erreur de chargement des polices.</Text>
// //             </SafeAreaView>
// //         );
// //     }

// //     // Helper function to convert base64 to blob
// //     const base64ToBlob = (base64: string, contentType: string) => {
// //         const byteCharacters = atob(base64);
// //         const byteArrays = [];
        
// //         for (let offset = 0; offset < byteCharacters.length; offset += 512) {
// //             const slice = byteCharacters.slice(offset, offset + 512);
            
// //             const byteNumbers = new Array(slice.length);
// //             for (let i = 0; i < slice.length; i++) {
// //                 byteNumbers[i] = slice.charCodeAt(i);
// //             }
            
// //             const byteArray = new Uint8Array(byteNumbers);
// //             byteArrays.push(byteArray);
// //         }
        
// //         return new Blob(byteArrays, { type: contentType });
// //     };

// //     const pickDocument = async (side: 'front' | 'back' | 'face') => {
// //         console.log(`[pickDocument] Attempting to pick document for: ${side}`);
// //         setError(null);
// //         try {
// //             const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
// //             if (!permissionResult.granted) {
// //                 Alert.alert('Permission Refusée', 'L\'accès à la galerie est nécessaire.');
// //                 return;
// //             }

// //             const result = await ImagePicker.launchImageLibraryAsync({
// //                 mediaTypes: ImagePicker.MediaTypeOptions.Images,
// //                 allowsEditing: false,
// //                 quality: 0.8,
// //             });

// //             console.log('[pickDocument] Result:', result);

// //             if (result.canceled) {
// //                 console.log('[pickDocument] User cancelled.');
// //                 return;
// //             }

// //             if (result.assets && result.assets.length > 0) {
// //                 const asset = result.assets[0];
// //                 console.log(`[pickImage] Picked for ${side}:`, asset.fileName, asset.uri);
// //                 if (side === 'front') setSelectedFileFront(asset);
// //                 else if (side === 'back') setSelectedFileBack(asset);
// //                 else if (side === 'face') setSelectedFaceFile(asset);
// //             } else {
// //                 console.log('[pickImage] No assets found.');
// //                 setError(`Aucune image sélectionnée.`);
// //             }
// //         } catch (err: any) {
// //             console.error(`[pickDocument] Error for ${side}:`, err);
// //             setError(`Erreur sélection image ${side}: ${err.message}`);
// //             Alert.alert('Erreur', `Impossible de sélectionner l'image ${side}: ${err.message}`);
// //         }
// //     };

// //     const uploadFile = async (
// //         file: ImagePickerAsset,
// //         pathPrefix: string
// //     ): Promise<string> => {
// //         const originalFileName = file.fileName ?? `${pathPrefix}_${Date.now()}`;
// //         console.log(`[uploadFile] Uploading ${pathPrefix}: ${originalFileName} from URI: ${file.uri}`);

// //         if (!file.uri || !user?.id) {
// //             throw new Error(`Infos utilisateur ou URI manquante pour ${pathPrefix}`);
// //         }

// //         try {
// //             const fileExt = originalFileName.split('.').pop()?.toLowerCase() ?? 'jpg';
// //             const fileName = `${user.id}-${pathPrefix}-${Date.now()}.${fileExt}`;
// //             const filePath = `${pathPrefix}/${fileName}`;
            
// //             let blob;
            
// //             if (Platform.OS === 'web') {
// //                 // Pour web: On récupère directement l'URI
// //                 console.log(`[uploadFile] Using web approach for ${pathPrefix}`);
// //                 try {
// //                     const response = await fetch(file.uri);
// //                     blob = await response.blob();
// //                 } catch (webErr: any) {
// //                     console.error(`[uploadFile] Web fetch error:`, webErr);
// //                     throw new Error(`Erreur lors de la récupération du fichier: ${webErr.message}`);
// //                 }
// //             } else {
// //                 // Pour mobile: On utilise FileSystem
// //                 console.log(`[uploadFile] Using native approach for ${pathPrefix}`);
// //                 try {
// //                     const fileInfo = await FileSystem.getInfoAsync(file.uri);
// //                     console.log(`[uploadFile] File info:`, fileInfo);
                    
// //                     const fileData = await FileSystem.readAsStringAsync(file.uri, {
// //                         encoding: FileSystem.EncodingType.Base64,
// //                     });
                    
// //                     blob = base64ToBlob(
// //                         fileData, 
// //                         file.mimeType ?? `image/${fileExt === 'png' ? 'png' : 'jpeg'}`
// //                     );
// //                 } catch (nativeErr: any) {
// //                     console.error(`[uploadFile] Native file reading error:`, nativeErr);
// //                     throw new Error(`Erreur lors de la lecture du fichier: ${nativeErr.message}`);
// //                 }
// //             }

// //             // Upload directly to Supabase storage
// //             const { data: uploadData, error: storageError } = await supabase.storage
// //                 .from('identity-documents')
// //                 .upload(filePath, blob, {
// //                     contentType: file.mimeType ?? `image/${fileExt === 'png' ? 'png' : 'jpeg'}`,
// //                     cacheControl: '3600',
// //                     upsert: false,
// //                 });

// //             if (storageError) {
// //                 console.error(`[uploadFile] Storage Error (${pathPrefix}):`, storageError);
// //                 throw storageError;
// //             }

// //             console.log(`[uploadFile] Success (${pathPrefix}):`, uploadData?.path);
// //             setUploadProgress(prev => Math.min(prev + 0.24, 1));

// //             return uploadData?.path ?? filePath;

// //         } catch (err: any) {
// //             console.error(`[uploadFile] Error (${pathPrefix}):`, err);
// //             if (err.message?.includes('bucket not found')) {
// //                 throw new Error(`Erreur: Bucket 'identity-documents' introuvable.`);
// //             } else if (err.message?.includes('mime type')) {
// //                 throw new Error(`Erreur: Type de fichier non autorisé (${file.mimeType}).`);
// //             }
// //             throw new Error(`Upload échoué (${pathPrefix}): ${err.message}`);
// //         }
// //     };

// //     const handleSubmit = async () => {
// //         setLoading(true);
// //         setError(null);
// //         setUploadProgress(0);
// //         console.log('[handleSubmit] Submitting verification...');

// //         try {
// //             if (!user) throw new Error('Vous devez être connecté');
// //             if (!documentNumber.trim()) throw new Error('Le numéro de document est requis');
// //             if (!selectedFileFront) throw new Error('Le recto du document est requis');
// //             if (!selectedFileBack) throw new Error('Le verso du document est requis');
// //             if (!selectedFaceFile) throw new Error('La photo du visage est requise');

// //             const filePathFront = await uploadFile(selectedFileFront, 'document-front');
// //             const filePathBack = await uploadFile(selectedFileBack, 'document-back');
// //             const filePathFace = await uploadFile(selectedFaceFile, 'user-faces');

// //             console.log('[handleSubmit] All files uploaded. Submitting details to DB...');

// //             const { error: submitError, data } = await supabase
// //                 .from('identity_verifications')
// //                 .insert({
// //                     user_id: user.id,
// //                     document_type: documentType,
// //                     document_number: documentNumber.trim().toUpperCase(),
// //                     verification_level: 2,
// //                     status: 'pending',
// //                     document_front_path: filePathFront,
// //                     document_back_path: filePathBack,
// //                     user_face_path: filePathFace,
// //                 })
// //                 .select(); // Récupérer les données insérées

// //             if (submitError) {
// //                 console.error('Submit Error:', submitError);
// //                 throw submitError;
// //             }

// //             console.log('[handleSubmit] Verification submitted successfully. Data:', data);
// //             Alert.alert('Succès', 'Vos documents ont été soumis pour vérification.');
// //             router.replace('/profile');

// //         } catch (err: any) {
// //             console.error('Error submitting verification:', err);
// //             setError(err.message || 'Une erreur est survenue lors de la soumission.');
// //             Alert.alert('Erreur', err.message || 'Une erreur est survenue.');
// //         } finally {
// //             setLoading(false);
// //         }
// //     };

// //     const getTruncatedFileName = (file: ImagePickerAsset | null): string => {
// //         if (!file || !file.fileName) return '';
// //         return file.fileName.length > 25 ? `${file.fileName.substring(0, 22)}...` : file.fileName;
// //     }

// //     return (
// //         <View style={styles.container}>
// //             {/* Header */}
// //             <View style={styles.header}>
// //                 <TouchableOpacity
// //                     style={styles.backButton}
// //                     onPress={() => router.back()}
// //                 >
// //                     <ChevronLeft size={24} color="#1e293b" />
// //                 </TouchableOpacity>
// //                 <Text style={styles.headerTitle}>Vérifier votre identité</Text>
// //             </View>

// //             <ScrollView style={styles.content}>
// //                 <Animated.View
// //                     entering={FadeIn.delay(200)}
// //                     style={styles.section}
// //                 >
// //                     <Text style={styles.title}>Étape 1: Informations du document</Text>
// //                     <Text style={styles.subtitle}>Sélectionnez le type de document et entrez le numéro.</Text>

// //                     {/* Sélection du type de document */}
// //                     <View style={styles.documentTypes}>
// //                         <TouchableOpacity
// //                             style={[styles.documentOption, documentType === 'cin' && styles.documentOptionSelected]}
// //                             onPress={() => setDocumentType('cin')}
// //                             disabled={loading}
// //                         >
// //                             <Card
// //                                 size={32}
// //                                 color={documentType === 'cin' ? '#ffffff' : '#0891b2'}
// //                             />
// //                             <Text style={[styles.documentOptionText, documentType === 'cin' && styles.documentOptionTextSelected]}>
// //                                 Carte d'identité nationale
// //                             </Text>
// //                         </TouchableOpacity>

// //                         <TouchableOpacity
// //                             style={[styles.documentOption, documentType === 'passport' && styles.documentOptionSelected]}
// //                             onPress={() => setDocumentType('passport')}
// //                             disabled={loading}
// //                         >
// //                             <Passport
// //                                 size={32}
// //                                 color={documentType === 'passport' ? '#ffffff' : '#0891b2'}
// //                             />
// //                             <Text style={[styles.documentOptionText, documentType === 'passport' && styles.documentOptionTextSelected]}>
// //                                 Passeport
// //                             </Text>
// //                         </TouchableOpacity>
// //                     </View>

// //                     {/* Numéro du document */}
// //                     <View style={styles.inputGroup}>
// //                         <Text style={styles.label}>Numéro de document</Text>
// //                         <TextInput
// //                             style={styles.input}
// //                             value={documentNumber}
// //                             onChangeText={setDocumentNumber}
// //                             placeholder={documentType === 'cin' ? "Ex: AB123456" : "Ex: XY1234567"}
// //                             placeholderTextColor="#94a3b8"
// //                             autoCapitalize="characters"
// //                         />
// //                     </View>

// //                     <Text style={styles.title}>Étape 2: Télécharger les documents</Text>
// //                     <Text style={styles.subtitle}>Téléchargez le recto, le verso de votre document et une photo de votre visage.</Text>

// //                     {/* Bouton Upload Recto */}
// //                     <TouchableOpacity
// //                         style={[styles.uploadButton, selectedFileFront && styles.uploadButtonSelected]}
// //                         onPress={() => pickDocument('front')}
// //                         disabled={loading}
// //                     >
// //                         {selectedFileFront ? <CheckCircle size={20} color="#ffffff" style={styles.uploadButtonIcon} /> : <UploadCloud size={20} color="#ffffff" style={styles.uploadButtonIcon} />}
// //                         <Text style={styles.uploadButtonText}>
// //                             {selectedFileFront ? `Recto: ${getTruncatedFileName(selectedFileFront)}` : 'Sélectionner le recto'}
// //                         </Text>
// //                     </TouchableOpacity>
// //                     {/* Aperçu Recto */}
// //                     {selectedFileFront?.uri && (
// //                         <Image source={{ uri: selectedFileFront.uri }} style={styles.previewImage} resizeMode="contain" />
// //                     )}

// //                     {/* Bouton Upload Verso */}
// //                     <TouchableOpacity
// //                         style={[styles.uploadButton, selectedFileBack && styles.uploadButtonSelected]}
// //                         onPress={() => pickDocument('back')}
// //                         disabled={loading}
// //                     >
// //                         {selectedFileBack ? <CheckCircle size={20} color="#ffffff" style={styles.uploadButtonIcon} /> : <UploadCloud size={20} color="#ffffff" style={styles.uploadButtonIcon} />}
// //                         <Text style={styles.uploadButtonText}>
// //                             {selectedFileBack ? `Verso: ${getTruncatedFileName(selectedFileBack)}` : 'Sélectionner le verso'}
// //                         </Text>
// //                     </TouchableOpacity>
// //                     {/* Aperçu Verso */}
// //                     {selectedFileBack?.uri && (
// //                         <Image source={{ uri: selectedFileBack.uri }} style={styles.previewImage} resizeMode="contain" />
// //                     )}

// //                     {/* Bouton Upload Visage */}
// //                     <TouchableOpacity
// //                         style={[styles.uploadButton, selectedFaceFile && styles.uploadButtonSelected]}
// //                         onPress={() => pickDocument('face')}
// //                         disabled={loading}
// //                     >
// //                         {selectedFaceFile ? <CheckCircle size={20} color="#ffffff" style={styles.uploadButtonIcon} /> : <UploadCloud size={20} color="#ffffff" style={styles.uploadButtonIcon} />}
// //                         <Text style={styles.uploadButtonText}>
// //                             {selectedFaceFile ? `Visage: ${getTruncatedFileName(selectedFaceFile)}` : 'Sélectionner photo visage'}
// //                         </Text>
// //                     </TouchableOpacity>
// //                     {/* Aperçu Visage */}
// //                     {selectedFaceFile?.uri && (
// //                         <Image source={{ uri: selectedFaceFile.uri }} style={styles.previewImage} resizeMode="contain" />
// //                     )}

// //                     {/* Barre de progression (optionnelle) */}
// //                     {loading && uploadProgress > 0 && uploadProgress < 1 && (
// //                         <View style={styles.progressBarContainer}>
// //                             <View style={[styles.progressBar, { width: `${uploadProgress * 100}%` }]} />
// //                             <Text style={styles.progressText}>
// //                                 {Math.round(uploadProgress * 100)}%
// //                             </Text>
// //                         </View>
// //                     )}

// //                     {/* Affichage de l'erreur */}
// //                     {error && (
// //                         <View style={styles.errorContainer}>
// //                             <Text style={styles.errorText}>{error}</Text>
// //                         </View>
// //                     )}

// //                     {/* Carte d'information */}
// //                     <View style={styles.infoCard}>
// //                         <Info size={24} color="#0891b2" />
// //                         <Text style={styles.infoTitle}>
// //                             Pourquoi vérifions-nous votre identité ?
// //                         </Text>
// //                         <Text style={styles.infoText}>
// //                             La vérification d'identité est nécessaire pour :{'\n\n'}
// //                             • Assurer la sécurité de notre communauté{'\n'}
// //                             • Prévenir la fraude{'\n'}
// //                             • Établir la confiance entre les utilisateurs{'\n'}
// //                             • Respecter les obligations légales
// //                         </Text>
// //                     </View>
// //                 </Animated.View>
// //             </ScrollView>

// //             {/* Footer avec bouton Soumettre */}
// //             <View style={styles.footer}>
// //                 <TouchableOpacity
// //                     style={[styles.submitButton, loading && styles.submitButtonDisabled]}
// //                     onPress={handleSubmit}
// //                     disabled={loading || !selectedFileFront || !selectedFileBack || !selectedFaceFile || !documentNumber.trim()}
// //                 >
// //                     <Text style={styles.submitButtonText}>
// //                         {loading ? 'Envoi en cours...' : 'Soumettre pour vérification'}
// //                     </Text>
// //                 </TouchableOpacity>
// //             </View>
// //         </View>
// //     );
// // }

// // const styles = StyleSheet.create({
// //     container: {
// //         flex: 1,
// //         backgroundColor: '#ffffff',
// //     },
// //     loadingContainer: {
// //         flex: 1,
// //         justifyContent: 'center',
// //         alignItems: 'center',
// //         backgroundColor: '#ffffff',
// //     },
// //     header: {
// //         flexDirection: 'row',
// //         alignItems: 'center',
// //         padding: 20,
// //         paddingTop: Platform.OS === 'web' ? 20 : 60,
// //         borderBottomWidth: 1,
// //         borderBottomColor: '#e5e7eb',
// //     },
// //     backButton: {
// //         width: 40,
// //         height: 40,
// //         borderRadius: 20,
// //         backgroundColor: '#f8fafc',
// //         justifyContent: 'center',
// //         alignItems: 'center',
// //         marginRight: 12,
// //     },
// //     headerTitle: {
// //         fontFamily: 'Montserrat-Bold',
// //         fontSize: 20,
// //         color: '#1e293b',
// //     },
// //     content: {
// //         flex: 1,
// //     },
// //     section: {
// //         padding: 20,
// //     },
// //     title: {
// //         fontFamily: 'Montserrat-Bold',
// //         fontSize: 24,
// //         color: '#1e293b',
// //         marginBottom: 8,
// //     },
// //     subtitle: {
// //         fontFamily: 'Montserrat-Regular',
// //         fontSize: 16,
// //         color: '#64748b',
// //         marginBottom: 24,
// //     },
// //     documentTypes: {
// //         gap: 16,
// //         marginBottom: 32,
// //     },
// //     documentOption: {
// //         flexDirection: 'row',
// //         alignItems: 'center',
// //         gap: 16,
// //         backgroundColor: '#f0f9ff',
// //         padding: 20,
// //         borderRadius: 12,
// //         borderWidth: 2,
// //         borderColor: '#e0f2fe',
// //     },
// //     documentOptionSelected: {
// //         backgroundColor: '#0891b2',
// //         borderColor: '#0891b2',
// //     },
// //     documentOptionText: {
// //         fontFamily: 'Montserrat-SemiBold',
// //         fontSize: 16,
// //         color: '#475569',
// //     },
// //     documentOptionTextSelected: {
// //         color: '#ffffff',
// //     },
// //     inputGroup: {
// //         gap: 8,
// //         marginBottom: 24,
// //     },
// //     label: {
// //         fontFamily: 'Montserrat-SemiBold',
// //         fontSize: 14,
// //         color: '#1e293b',
// //     },
// //     input: {
// //         fontFamily: 'Montserrat-Regular',
// //         fontSize: 16,
// //         color: '#1e293b',
// //         backgroundColor: '#f8fafc',
// //         padding: 16,
// //         borderRadius: 12,
// //     },
// //     errorContainer: {
// //         backgroundColor: '#fef2f2',
// //         padding: 16,
// //         borderRadius: 12,
// //         marginBottom: 24,
// //     },
// //     errorText: {
// //         fontFamily: 'Montserrat-Regular',
// //         fontSize: 14,
// //         color: '#dc2626',
// //         textAlign: 'center',
// //     },
// //     infoCard: {
// //         backgroundColor: '#f0f9ff',
// //         padding: 20,
// //         borderRadius: 16,
// //         gap: 12,
// //     },
// //     infoTitle: {
// //         fontFamily: 'Montserrat-Bold',
// //         fontSize: 18,
// //         color: '#0891b2',
// //     },
// //     infoText: {
// //         fontFamily: 'Montserrat-Regular',
// //         fontSize: 14,
// //         color: '#1e293b',
// //         lineHeight: 20,
// //     },
// //     footer: {
// //         padding: 20,
// //         backgroundColor: '#ffffff',
// //         borderTopWidth: 1,
// //         borderTopColor: '#e5e7eb',
// //     },
// //     submitButton: {
// //         backgroundColor: '#059669',
// //         paddingVertical: 14,
// //         borderRadius: 10,
// //         alignItems: 'center',
// //     },
// //     submitButtonDisabled: {
// //         backgroundColor: '#9ca3af',
// //     },
// //     submitButtonText: {
// //         fontFamily: 'Montserrat-SemiBold',
// //         fontSize: 16,
// //         color: '#ffffff',
// //     },
// //     uploadButton: {
// //         backgroundColor: '#f3f4f6',
// //         paddingVertical: 12,
// //         borderRadius: 8,
// //         alignItems: 'center',
// //         marginBottom: 12,
// //     },
// //     uploadButtonSelected: {
// //         backgroundColor: '#dcfce7',
// //     },
// //     uploadButtonText: {
// //         fontFamily: 'Montserrat-SemiBold',
// //         fontSize: 14,
// //         color: '#374151',
// //     },
// //     uploadButtonIcon: {
// //         marginBottom: 4,
// //     },
// //     previewImage: {
// //         width: 100,
// //         height: 100,
// //         borderRadius: 8,
// //         marginTop: 8,
// //         marginBottom: 16,
// //     },
// //     progressBarContainer: {
// //         height: 10,
// //         backgroundColor: '#e5e7eb',
// //         borderRadius: 5,
// //         overflow: 'hidden',
// //         marginTop: 8,
// //         marginBottom: 16,
// //     },
// //     progressBar: {
// //         height: '100%',
// //         backgroundColor: '#059669',
// //         borderRadius: 5,
// //     },
// //     progressText: {
// //         fontFamily: 'Montserrat-Regular',
// //         fontSize: 12,
// //         color: '#4b5563',
// //         marginTop: 4,
// //         textAlign: 'center',
// //     },
// // });


// // import React, { useState, useEffect } from 'react';
// // import {
// //     View,
// //     Text,
// //     StyleSheet,
// //     ScrollView,
// //     TouchableOpacity,
// //     TextInput,
// //     Platform,
// //     ActivityIndicator,
// //     Image,
// //     Alert,
// //     SafeAreaView,
// // } from 'react-native';
// // import {
// //     useFonts,
// //     Montserrat_700Bold,
// //     Montserrat_600SemiBold,
// //     Montserrat_400Regular,
// // } from '@expo-google-fonts/montserrat';
// // import {
// //     ChevronLeft,
// //     CreditCard as Card,
// //     Import as Passport, // Attention: 'Import' est un mot-clé, Passport est un bon alias
// //     CheckCircle,
// //     UploadCloud,
// //     Info,
// // } from 'lucide-react-native';
// // import { router, SplashScreen, Stack } from 'expo-router';
// // import { supabase } from '@/lib/supabase';
// // import { useAuth } from '@/hooks/useAuth';
// // import Animated, { FadeIn } from 'react-native-reanimated';
// // import * as ImagePicker from 'expo-image-picker';
// // import * as FileSystem from 'expo-file-system';
// // import { Buffer } from 'buffer';

// // // Polyfill pour atob si nécessaire (important pour FileSystem base64 conversion)
// // if (typeof global.atob === 'undefined') {
// //     global.atob = (data) => Buffer.from(data, 'base64').toString('binary');
// // }
// // if (typeof global.Blob === 'undefined') {
// //      // Minimal polyfill or consider using a library like 'react-native-blob-util' if more features are needed
// //      // This basic polyfill might not cover all Blob functionalities
// //      global.Blob = class Blob {
// //         _buffer: Buffer;
// //         _options: { type: string };
// //         size: number;
// //         type: string;

// //         constructor(parts: (Buffer | string | Blob)[], options?: { type: string }) {
// //             const buffers = parts.map(part => {
// //                 if (part instanceof Buffer) return part;
// //                 if (part instanceof Blob) return part._buffer;
// //                 return Buffer.from(String(part));
// //             });
// //             this._buffer = Buffer.concat(buffers);
// //             this._options = { type: options?.type || '' };
// //             this.size = this._buffer.length;
// //             this.type = this._options.type;
// //         }
// //          // Add other methods like slice() if necessary
// //     } as any;
// // }


// // type ImagePickerAsset = ImagePicker.ImagePickerAsset;

// // SplashScreen.preventAutoHideAsync();

// // type DocumentType = 'cin' | 'passport';

// // export default function VerifyIdentityScreen() {
// //     const { user } = useAuth();
// //     const [documentType, setDocumentType] = useState<DocumentType>('cin');
// //     const [documentNumber, setDocumentNumber] = useState('');
// //     const [selectedFileFront, setSelectedFileFront] = useState<ImagePickerAsset | null>(null);
// //     const [selectedFileBack, setSelectedFileBack] = useState<ImagePickerAsset | null>(null);
// //     const [selectedFaceFile, setSelectedFaceFile] = useState<ImagePickerAsset | null>(null);
// //     const [loading, setLoading] = useState(false);
// //     const [error, setError] = useState<string | null>(null);
// //     const [uploadProgress, setUploadProgress] = useState<number>(0); // Progression totale (0 à 1)

// //     const [fontsLoaded, fontError] = useFonts({
// //         'Montserrat-Bold': Montserrat_700Bold,
// //         'Montserrat-SemiBold': Montserrat_600SemiBold,
// //         'Montserrat-Regular': Montserrat_400Regular,
// //     });

// //     useEffect(() => {
// //         if (fontsLoaded || fontError) {
// //             SplashScreen.hideAsync();
// //         }
// //     }, [fontsLoaded, fontError]);

// //     // Helper function to convert base64 to Blob (using polyfills)
// //     const base64ToBlob = (base64: string, contentType: string): Blob => {
// //         try {
// //             const byteCharacters = atob(base64); // Use polyfilled atob
// //             const byteArrays = [];

// //             for (let offset = 0; offset < byteCharacters.length; offset += 512) {
// //                 const slice = byteCharacters.slice(offset, offset + 512);
// //                 const byteNumbers = new Array(slice.length);
// //                 for (let i = 0; i < slice.length; i++) {
// //                     byteNumbers[i] = slice.charCodeAt(i);
// //                 }
// //                 const byteArray = new Uint8Array(byteNumbers);
// //                 byteArrays.push(byteArray);
// //             }

// //             return new Blob(byteArrays, { type: contentType }); // Use polyfilled Blob
// //         } catch (e) {
// //              console.error("Error in base64ToBlob:", e);
// //              throw new Error("Failed to convert base64 to Blob.");
// //         }
// //     };


// //     const pickDocument = async (side: 'front' | 'back' | 'face') => {
// //         console.log(`[pickDocument] Attempting to pick document for: ${side}`);
// //         setError(null);
// //         try {
// //             const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
// //             if (!permissionResult.granted) {
// //                 Alert.alert('Permission Refusée', 'L\'accès à la galerie est nécessaire.');
// //                 return;
// //             }

// //             const result = await ImagePicker.launchImageLibraryAsync({
// //                 mediaTypes: ImagePicker.MediaTypeOptions.Images,
// //                 allowsEditing: false, // Garder false pour les documents officiels
// //                 quality: 0.7, // Qualité légèrement réduite pour l'upload
// //                 // base64: true // Peut être utile si la lecture URI échoue systématiquement
// //             });

// //             console.log('[pickDocument] Result:', result);

// //             if (result.canceled) {
// //                 console.log('[pickDocument] User cancelled.');
// //                 return;
// //             }

// //             if (result.assets && result.assets.length > 0) {
// //                 const asset = result.assets[0];
// //                 // Vérification taille fichier (optionnel, ex: max 5MB)
// //                 if (asset.fileSize && asset.fileSize > 5 * 1024 * 1024) {
// //                     Alert.alert('Fichier trop volumineux', 'Veuillez choisir une image de moins de 5 Mo.');
// //                     return;
// //                 }
// //                 console.log(`[pickImage] Picked for ${side}:`, asset.fileName, asset.uri, asset.mimeType, asset.fileSize);
// //                 if (side === 'front') setSelectedFileFront(asset);
// //                 else if (side === 'back') setSelectedFileBack(asset);
// //                 else if (side === 'face') setSelectedFaceFile(asset);
// //             } else {
// //                 console.log('[pickImage] No assets found.');
// //                 setError(`Aucune image sélectionnée.`);
// //             }
// //         } catch (err: any) {
// //             console.error(`[pickDocument] Error for ${side}:`, err);
// //             setError(`Erreur sélection image ${side}: ${err.message}`);
// //             Alert.alert('Erreur', `Impossible de sélectionner l'image ${side}: ${err.message}`);
// //         }
// //     };

// //     // --- Fonction Upload Corrigée ---
// //     const uploadFile = async (
// //         file: ImagePickerAsset,
// //         // Le pathPrefix ici détermine le dossier *logique* (ex: 'user-faces')
// //         pathPrefix: string
// //     ): Promise<string> => {
// //         // Nom de base pour le fichier (si fileName est null)
// //         const originalFileName = file.fileName ?? `${pathPrefix}_${Date.now()}`;
// //         console.log(`[uploadFile] Uploading ${pathPrefix}: ${originalFileName} from URI: ${file.uri}`);

// //         if (!file.uri || !user?.id) {
// //             throw new Error(`Infos utilisateur ou URI manquante pour ${pathPrefix}`);
// //         }

// //         try {
// //             const fileExt = originalFileName.split('.').pop()?.toLowerCase() ?? 'jpg';
// //             // Crée un nom de fichier unique et informatif
// //             const fileName = `${user.id}-${pathPrefix}-${Date.now()}.${fileExt}`;

// //             // --- CORRECTION DU CHEMIN DE STOCKAGE ---
// //             // Ne pas ajouter le dossier parent 'identity-documents' au chemin
// //             // car 'from' spécifie déjà le bucket
// //             const filePath = `${pathPrefix}/${fileName}`;
// //             // Exemple: filePath sera "document-front/xyz.jpg"
// //             console.log(`[uploadFile] Constructed filePath for storage: ${filePath}`); // Log important
// //             // --------------------------------------

// //             let fileData: string | null = null; // Pour stocker le base64 si nécessaire
// //             let blob: Blob | null = null;
// //             const contentType = file.mimeType ?? `image/${fileExt === 'png' ? 'png' : 'jpeg'}`;

// //             // Essayer de lire le fichier
// //             try {
// //                  if (Platform.OS === 'web') {
// //                     console.log(`[uploadFile] Using web fetch for ${pathPrefix}`);
// //                     const response = await fetch(file.uri);
// //                     if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
// //                     blob = await response.blob();
// //                  } else {
// //                     console.log(`[uploadFile] Using native FileSystem for ${pathPrefix}`);
// //                     // S'assurer que l'URI est accessible
// //                     const fileInfo = await FileSystem.getInfoAsync(file.uri);
// //                     if (!fileInfo.exists) {
// //                         throw new Error(`Le fichier local n'existe pas à l'URI: ${file.uri}`);
// //                     }
// //                     console.log(`[uploadFile] Native file info for ${file.uri}:`, fileInfo);
// //                     fileData = await FileSystem.readAsStringAsync(file.uri, {
// //                         encoding: FileSystem.EncodingType.Base64,
// //                     });
// //                     blob = base64ToBlob(fileData, contentType);
// //                  }
// //             } catch (readError: any) {
// //                  console.error(`[uploadFile] Error reading file (${Platform.OS}) for ${pathPrefix}:`, readError);
// //                  throw new Error(`Erreur lecture fichier (${pathPrefix}): ${readError.message}`);
// //             }

// //              if (!blob) {
// //                  throw new Error(`Impossible de créer un Blob pour le fichier ${pathPrefix}`);
// //              }

// //              console.log(`[uploadFile] Blob created for ${pathPrefix}, size: ${blob.size}, type: ${blob.type}. Uploading...`);

// //             // Upload vers Supabase storage avec le chemin corrigé
// //             const { data: uploadData, error: storageError } = await supabase.storage
// //                 .from('identity-documents') // <- Nom du Bucket
// //                 .upload(filePath, blob, { // <- Utilise le filePath corrigé (sans le préfixe "identity-documents/")
// //                     contentType: contentType,
// //                     cacheControl: '3600', // Cache pour 1 heure
// //                     upsert: false, // Ne pas écraser si le fichier existe déjà (improbable avec timestamp)
// //                 });

// //             if (storageError) {
// //                 console.error(`[uploadFile] Supabase Storage Error (${filePath}):`, storageError);
// //                 throw storageError; // Propage l'erreur Supabase
// //             }

// //             console.log(`[uploadFile] Upload Success (${pathPrefix}). Path stored:`, uploadData?.path);
// //             setUploadProgress(prev => Math.min(prev + 1 / 3, 1)); // Met à jour la progression (1/3 par fichier)

// //             // Retourne le chemin complet qui a été utilisé (important pour la BDD)
// //             return uploadData?.path ?? filePath; // uploadData.path est la source de vérité

// //         } catch (err: any) {
// //             // Gestion d'erreur améliorée
// //             console.error(`[uploadFile] Overall Error (${pathPrefix}):`, err);
// //             let displayMessage = `Upload échoué (${pathPrefix}): ${err.message}`;
// //             if (err.message?.includes('Bucket not found')) {
// //                 displayMessage = `Erreur Configuration: Bucket 'identity-documents' introuvable. Vérifiez le nom.`;
// //             } else if (err.message?.includes('mime type') || err.message?.includes('content-type')) {
// //                 displayMessage = `Erreur: Type de fichier non autorisé (${contentType}).`;
// //             } else if (err.message?.includes(' RLS policy')) {
// //                  displayMessage = `Erreur Permissions: Impossible d'uploader dans le bucket. Vérifiez les policies Storage.`;
// //             }
// //             throw new Error(displayMessage);
// //         }
// //     };
// //     // --- Fin Fonction Upload Corrigée ---

// //     const handleSubmit = async () => {
// //         setLoading(true);
// //         setError(null);
// //         setUploadProgress(0); // Reset la progression
// //         console.log('[handleSubmit] Submitting verification...');

// //         // Variables pour stocker les chemins, initialisées à null
// //         let filePathFront: string | null = null;
// //         let filePathBack: string | null = null;
// //         let filePathFace: string | null = null;

// //         try {
// //             if (!user) throw new Error('Vous devez être connecté');
// //             if (!documentNumber.trim()) throw new Error('Le numéro de document est requis');
// //             if (!selectedFileFront) throw new Error('Le recto du document est requis');
// //             if (!selectedFileBack) throw new Error('Le verso du document est requis');
// //             if (!selectedFaceFile) throw new Error('La photo du visage est requise');

// //             // Uploader chaque fichier séquentiellement pour mieux gérer les erreurs et la progression
// //             console.log('[handleSubmit] Uploading front...');
// //             filePathFront = await uploadFile(selectedFileFront, 'document-front');

// //             console.log('[handleSubmit] Uploading back...');
// //             filePathBack = await uploadFile(selectedFileBack, 'document-back');

// //             console.log('[handleSubmit] Uploading face...');
// //             filePathFace = await uploadFile(selectedFaceFile, 'user-faces');

// //             console.log('[handleSubmit] All files uploaded successfully. Submitting details to DB...');
// //             setUploadProgress(1); // Marquer comme 100%

// //             // Insérer les chemins complets dans la base de données
// //             const { error: submitError, data } = await supabase
// //                 .from('identity_verifications')
// //                 .insert({
// //                     user_id: user.id,
// //                     document_type: documentType,
// //                     document_number: documentNumber.trim().toUpperCase(),
// //                     verification_level: 2, // Ou le niveau approprié
// //                     status: 'pending',
// //                     document_front_path: filePathFront, // Chemin corrigé
// //                     document_back_path: filePathBack,   // Chemin corrigé
// //                     user_face_path: filePathFace,       // Chemin corrigé
// //                 })
// //                 .select() // Optionnel: récupérer les données insérées

// //             if (submitError) {
// //                 console.error('[handleSubmit] DB Submit Error:', submitError);
// //                 throw submitError;
// //             }

// //             console.log('[handleSubmit] Verification submitted successfully. DB Data:', data);
// //             Alert.alert('Succès', 'Vos documents ont été soumis pour vérification.');
// //             router.replace('/profile'); // Rediriger vers le profil ou une page de confirmation

// //         } catch (err: any) {
// //             console.error('[handleSubmit] Error during submission process:', err);
// //             // Afficher l'erreur spécifique remontée par uploadFile ou l'insertion DB
// //             setError(err.message || 'Une erreur est survenue lors de la soumission.');
// //             Alert.alert('Erreur de soumission', err.message || 'Une erreur est survenue.');
// //         } finally {
// //             setLoading(false);
// //             // Ne pas reset la progression ici pour que l'utilisateur voie 100% ou l'erreur
// //         }
// //     };


// //     const getTruncatedFileName = (file: ImagePickerAsset | null): string => {
// //         if (!file || !file.fileName) return 'Fichier sélectionné'; // Texte par défaut si pas de nom
// //         const name = file.fileName;
// //         // Tronquer si plus long que 25 caractères
// //         return name.length > 25 ? `${name.substring(0, 22)}...` : name;
// //     }

// //     // --- Rendu JSX ---
// //     if (!fontsLoaded && !fontError) {
// //         return <SafeAreaView style={styles.loadingContainer}><ActivityIndicator size="large" color="#0891b2" /></SafeAreaView>;
// //     }
// //      if (fontError) {
// //         return <SafeAreaView style={styles.loadingContainer}><Text style={styles.errorText}>Erreur chargement polices.</Text></SafeAreaView>;
// //     }

// //     return (
// //         <SafeAreaView style={styles.container}>
// //             <Stack.Screen options={{ headerShown: false }} />
// //             {/* Header */}
// //             <View style={styles.header}>
// //                 <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
// //                     <ChevronLeft size={24} color="#1e293b" />
// //                 </TouchableOpacity>
// //                 <Text style={styles.headerTitle}>Vérifier votre identité</Text>
// //                 <View style={{ width: 40 }} /> {/* Spacer */}
// //             </View>

// //             <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
// //                 <Animated.View entering={FadeIn.delay(100)} style={styles.section}>

// //                     {/* Etape 1: Infos */}
// //                     <Text style={styles.title}>Étape 1: Informations</Text>
// //                     <Text style={styles.subtitle}>Sélectionnez le type et entrez le numéro.</Text>
// //                     {/* Type de document */}
// //                     <View style={styles.documentTypes}>
// //                          <TouchableOpacity
// //                             style={[styles.documentOption, documentType === 'cin' && styles.documentOptionSelected]}
// //                             onPress={() => setDocumentType('cin')} disabled={loading} >
// //                             <Card size={28} color={documentType === 'cin' ? '#ffffff' : '#0891b2'} />
// //                             <Text style={[styles.documentOptionText, documentType === 'cin' && styles.documentOptionTextSelected]}>
// //                                 Carte d'identité
// //                             </Text>
// //                         </TouchableOpacity>
// //                          <TouchableOpacity
// //                             style={[styles.documentOption, documentType === 'passport' && styles.documentOptionSelected]}
// //                              onPress={() => setDocumentType('passport')} disabled={loading} >
// //                              <Passport size={28} color={documentType === 'passport' ? '#ffffff' : '#0891b2'} />
// //                              <Text style={[styles.documentOptionText, documentType === 'passport' && styles.documentOptionTextSelected]}>
// //                                 Passeport
// //                              </Text>
// //                          </TouchableOpacity>
// //                     </View>
// //                     {/* Numéro */}
// //                     <View style={styles.inputGroup}>
// //                         <Text style={styles.label}>Numéro du document</Text>
// //                         <TextInput
// //                             style={styles.input} value={documentNumber} onChangeText={setDocumentNumber}
// //                             placeholder={documentType === 'cin' ? "Ex: AB123456" : "Ex: XY1234567"}
// //                             placeholderTextColor="#94a3b8" autoCapitalize="characters" />
// //                     </View>

// //                      {/* Etape 2: Upload */}
// //                     <Text style={styles.title}>Étape 2: Télécharger</Text>
// //                     <Text style={styles.subtitle}>Recto, verso et une photo de vous.</Text>

// //                     {/* Upload Recto */}
// //                      <TouchableOpacity
// //                          style={[styles.uploadButton, selectedFileFront ? styles.uploadButtonSelected : styles.uploadButtonIdle]}
// //                          onPress={() => pickDocument('front')} disabled={loading} >
// //                          {selectedFileFront ? <CheckCircle size={20} color="#15803d" style={styles.uploadButtonIcon} /> : <UploadCloud size={20} color="#475569" style={styles.uploadButtonIcon} />}
// //                          <Text style={[styles.uploadButtonText, selectedFileFront && styles.uploadButtonTextSelected]}>
// //                              {selectedFileFront ? `${getTruncatedFileName(selectedFileFront)}` : 'Sélectionner le recto'}
// //                          </Text>
// //                      </TouchableOpacity>
// //                      {selectedFileFront?.uri && ( <Image source={{ uri: selectedFileFront.uri }} style={styles.previewImage} resizeMode="contain" /> )}

// //                     {/* Upload Verso */}
// //                      <TouchableOpacity
// //                          style={[styles.uploadButton, selectedFileBack ? styles.uploadButtonSelected : styles.uploadButtonIdle]}
// //                          onPress={() => pickDocument('back')} disabled={loading} >
// //                          {selectedFileBack ? <CheckCircle size={20} color="#15803d" style={styles.uploadButtonIcon} /> : <UploadCloud size={20} color="#475569" style={styles.uploadButtonIcon} />}
// //                          <Text style={[styles.uploadButtonText, selectedFileBack && styles.uploadButtonTextSelected]}>
// //                              {selectedFileBack ? `${getTruncatedFileName(selectedFileBack)}` : 'Sélectionner le verso'}
// //                          </Text>
// //                      </TouchableOpacity>
// //                     {selectedFileBack?.uri && ( <Image source={{ uri: selectedFileBack.uri }} style={styles.previewImage} resizeMode="contain" /> )}

// //                     {/* Upload Visage */}
// //                     <TouchableOpacity
// //                          style={[styles.uploadButton, selectedFaceFile ? styles.uploadButtonSelected : styles.uploadButtonIdle]}
// //                          onPress={() => pickDocument('face')} disabled={loading} >
// //                          {selectedFaceFile ? <CheckCircle size={20} color="#15803d" style={styles.uploadButtonIcon} /> : <UploadCloud size={20} color="#475569" style={styles.uploadButtonIcon} />}
// //                          <Text style={[styles.uploadButtonText, selectedFaceFile && styles.uploadButtonTextSelected]}>
// //                              {selectedFaceFile ? `${getTruncatedFileName(selectedFaceFile)}` : 'Sélectionner une photo de vous :  Votre pièce d\'identité doit apparaitre clairement ainsi que votre visage !'}
// //                          </Text>
// //                      </TouchableOpacity>
// //                     {selectedFaceFile?.uri && ( <Image source={{ uri: selectedFaceFile.uri }} style={styles.previewImage} resizeMode="contain" /> )}

// //                     {/* Barre de progression */}
// //                      {loading && uploadProgress > 0 && ( // Afficher dès le début de l'upload
// //                         <View style={styles.progressContainer}>
// //                              <Text style={styles.progressLabel}>Upload en cours...</Text>
// //                             <View style={styles.progressBarBackground}>
// //                                  <Animated.View style={[styles.progressBarFill, { width: `${uploadProgress * 100}%` }]} />
// //                             </View>
// //                             <Text style={styles.progressPercentage}>{Math.round(uploadProgress * 100)}%</Text>
// //                          </View>
// //                     )}

// //                     {/* Affichage Erreur */}
// //                     {error && ( <View style={styles.errorDisplay}><Text style={styles.errorText}>{error}</Text></View> )}

// //                     {/* Carte Info */}
// //                     <View style={styles.infoCard}>
// //                         <Info size={20} color="#0891b2" />
// //                         <View>
// //                              <Text style={styles.infoTitle}>Pourquoi cette vérification ?</Text>
// //                              <Text style={styles.infoText}>Pour la sécurité, prévenir la fraude, établir la confiance et respecter les obligations légales.</Text>
// //                          </View>
// //                     </View>

// //                 </Animated.View>
// //             </ScrollView>

// //             {/* Footer Bouton Soumettre */}
// //             <View style={styles.footer}>
// //                  <TouchableOpacity
// //                     style={[styles.submitButton, (loading || !selectedFileFront || !selectedFileBack || !selectedFaceFile || !documentNumber.trim()) && styles.submitButtonDisabled]}
// //                     onPress={handleSubmit}
// //                     disabled={loading || !selectedFileFront || !selectedFileBack || !selectedFaceFile || !documentNumber.trim()} >
// //                      {loading ? (
// //                          <ActivityIndicator color="#ffffff" />
// //                      ) : (
// //                         <Text style={styles.submitButtonText}>Soumettre pour vérification</Text>
// //                      )}
// //                  </TouchableOpacity>
// //             </View>
// //         </SafeAreaView>
// //     );
// // }

// // // --- Styles ---
// // const styles = StyleSheet.create({
// //     container: { flex: 1, backgroundColor: '#f8fafc' }, // Fond légèrement gris
// //     loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' },
// //     header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, paddingTop: Platform.OS === 'android' ? 30 : 50, backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
// //     backButton: { padding: 8 }, // Simplifié
// //     headerTitle: { fontFamily: 'Montserrat-Bold', fontSize: 18, color: '#1e293b', flex: 1, textAlign: 'center', marginLeft: -40 /* Compenser le bouton retour */ },
// //     content: { flex: 1 },
// //     section: { paddingHorizontal: 20, paddingVertical: 10 },
// //     title: { fontFamily: 'Montserrat-Bold', fontSize: 20, color: '#1e293b', marginBottom: 6, marginTop: 20 },
// //     subtitle: { fontFamily: 'Montserrat-Regular', fontSize: 14, color: '#64748b', marginBottom: 20 },
// //     documentTypes: { gap: 12, marginBottom: 24 },
// //     documentOption: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#ffffff', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0' },
// //     documentOptionSelected: { backgroundColor: '#0891b2', borderColor: '#0891b2' },
// //     documentOptionText: { fontFamily: 'Montserrat-SemiBold', fontSize: 15, color: '#334155', flexShrink: 1 /* Permet au texte de passer à la ligne si besoin */ },
// //     documentOptionTextSelected: { color: '#ffffff' },
// //     inputGroup: { gap: 6, marginBottom: 20 },
// //     label: { fontFamily: 'Montserrat-SemiBold', fontSize: 14, color: '#334155' },
// //     input: { fontFamily: 'Montserrat-Regular', fontSize: 16, color: '#1e293b', backgroundColor: '#ffffff', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 8, borderWidth: 1, borderColor: '#cbd5e1' },
// //     uploadButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16, borderRadius: 8, marginBottom: 8, borderWidth: 1 },
// //     uploadButtonIdle: { backgroundColor: '#f1f5f9', borderColor: '#e2e8f0' },
// //     uploadButtonSelected: { backgroundColor: '#dcfce7', borderColor: '#86efac' }, // Vert clair pour sélectionné
// //     uploadButtonIcon: { marginRight: 10 },
// //     uploadButtonText: { fontFamily: 'Montserrat-SemiBold', fontSize: 14, color: '#475569', flexShrink: 1 },
// //     uploadButtonTextSelected: { color: '#15803d' }, // Texte vert foncé
// //     previewImage: { width: 80, height: 60, borderRadius: 6, marginTop: 0, marginBottom: 16, alignSelf: 'flex-start', borderWidth: 1, borderColor: '#e5e7eb' },
// //     progressContainer: { marginTop: 16, marginBottom: 16 },
// //     progressLabel: { fontFamily: 'Montserrat-Regular', fontSize: 12, color: '#64748b', marginBottom: 4 },
// //     progressBarBackground: { height: 8, backgroundColor: '#e5e7eb', borderRadius: 4, overflow: 'hidden' },
// //     progressBarFill: { height: '100%', backgroundColor: '#059669', borderRadius: 4 },
// //     progressPercentage: { fontFamily: 'Montserrat-SemiBold', fontSize: 12, color: '#4b5563', marginTop: 4, textAlign: 'right' },
// //     errorDisplay: { backgroundColor: '#fee2e2', padding: 12, borderRadius: 8, marginTop: 10, marginBottom: 20, borderWidth: 1, borderColor: '#fecaca' },
// //     errorText: { fontFamily: 'Montserrat-Regular', fontSize: 14, color: '#dc2626', textAlign: 'center' },
// //     infoCard: { flexDirection: 'row', backgroundColor: '#f0f9ff', padding: 16, borderRadius: 12, gap: 12, alignItems: 'flex-start', marginTop: 20, borderWidth: 1, borderColor: '#e0f2fe' },
// //     infoTitle: { fontFamily: 'Montserrat-SemiBold', fontSize: 15, color: '#0369a1', marginBottom: 4 },
// //     infoText: { fontFamily: 'Montserrat-Regular', fontSize: 13, color: '#334155', lineHeight: 18 },
// //     footer: { padding: 16, backgroundColor: '#ffffff', borderTopWidth: 1, borderTopColor: '#e5e7eb' },
// //     submitButton: { backgroundColor: '#059669', paddingVertical: 16, borderRadius: 10, alignItems: 'center' },
// //     submitButtonDisabled: { backgroundColor: '#9ca3af', opacity: 0.7 },
// //     submitButtonText: { fontFamily: 'Montserrat-SemiBold', fontSize: 16, color: '#ffffff' },
// // });

// import React, { useState, useEffect } from 'react';
// import {
//     View,
//     Text,
//     StyleSheet,
//     ScrollView,
//     TouchableOpacity,
//     TextInput,
//     Platform,
//     ActivityIndicator,
//     Image,
//     Alert,
//     SafeAreaView,
// } from 'react-native';
// import {
//     useFonts,
//     Montserrat_700Bold,
//     Montserrat_600SemiBold,
//     Montserrat_400Regular,
// } from '@expo-google-fonts/montserrat';
// import {
//     ChevronLeft,
//     CreditCard as Card,
//     Import as Passport, // Attention: 'Import' est un mot-clé, Passport est un bon alias
//     CheckCircle,
//     UploadCloud,
//     Info,
// } from 'lucide-react-native';
// import { router, SplashScreen, Stack } from 'expo-router';
// import { supabase } from '@/lib/supabase';
// import { useAuth } from '@/hooks/useAuth';
// import Animated, { FadeIn } from 'react-native-reanimated';
// import * as ImagePicker from 'expo-image-picker';
// import * as FileSystem from 'expo-file-system';
// import { Buffer } from 'buffer';

// // Polyfill pour atob si nécessaire (important pour FileSystem base64 conversion)
// if (typeof global.atob === 'undefined') {
//     global.atob = (data) => Buffer.from(data, 'base64').toString('binary');
// }
// if (typeof global.Blob === 'undefined') {
//      // Minimal polyfill or consider using a library like 'react-native-blob-util' if more features are needed
//      // This basic polyfill might not cover all Blob functionalities
//      global.Blob = class Blob {
//         _buffer: Buffer;
//         _options: { type: string };
//         size: number;
//         type: string;

//         constructor(parts: (Buffer | string | Blob)[], options?: { type: string }) {
//             const buffers = parts.map(part => {
//                 if (part instanceof Buffer) return part;
//                 if (part instanceof Blob) return part._buffer;
//                 return Buffer.from(String(part));
//             });
//             this._buffer = Buffer.concat(buffers);
//             this._options = { type: options?.type || '' };
//             this.size = this._buffer.length;
//             this.type = this._options.type;
//         }
//          // Add other methods like slice() if necessary
//     } as any;
// }


// type ImagePickerAsset = ImagePicker.ImagePickerAsset;

// SplashScreen.preventAutoHideAsync();

// type DocumentType = 'cin' | 'passport';

// export default function VerifyIdentityScreen() {
//     // Ajout de refreshVerificationStatus depuis useAuth
//     const { user, refreshVerificationStatus } = useAuth();
//     const [documentType, setDocumentType] = useState<DocumentType>('cin');
//     const [documentNumber, setDocumentNumber] = useState('');
//     const [selectedFileFront, setSelectedFileFront] = useState<ImagePickerAsset | null>(null);
//     const [selectedFileBack, setSelectedFileBack] = useState<ImagePickerAsset | null>(null);
//     const [selectedFaceFile, setSelectedFaceFile] = useState<ImagePickerAsset | null>(null);
//     const [loading, setLoading] = useState(false);
//     const [error, setError] = useState<string | null>(null);
//     const [uploadProgress, setUploadProgress] = useState<number>(0); // Progression totale (0 à 1)

//     const [fontsLoaded, fontError] = useFonts({
//         'Montserrat-Bold': Montserrat_700Bold,
//         'Montserrat-SemiBold': Montserrat_600SemiBold,
//         'Montserrat-Regular': Montserrat_400Regular,
//     });

//     useEffect(() => {
//         if (fontsLoaded || fontError) {
//             SplashScreen.hideAsync();
//         }
//     }, [fontsLoaded, fontError]);

//     // Helper function to convert base64 to Blob (using polyfills)
//     const base64ToBlob = (base64: string, contentType: string): Blob => {
//         try {
//             const byteCharacters = atob(base64); // Use polyfilled atob
//             const byteArrays = [];

//             for (let offset = 0; offset < byteCharacters.length; offset += 512) {
//                 const slice = byteCharacters.slice(offset, offset + 512);
//                 const byteNumbers = new Array(slice.length);
//                 for (let i = 0; i < slice.length; i++) {
//                     byteNumbers[i] = slice.charCodeAt(i);
//                 }
//                 const byteArray = new Uint8Array(byteNumbers);
//                 byteArrays.push(byteArray);
//             }

//             return new Blob(byteArrays, { type: contentType }); // Use polyfilled Blob
//         } catch (e) {
//              console.error("Error in base64ToBlob:", e);
//              throw new Error("Failed to convert base64 to Blob.");
//         }
//     };


//     const pickDocument = async (side: 'front' | 'back' | 'face') => {
//         console.log(`[pickDocument] Attempting to pick document for: ${side}`);
//         setError(null);
//         try {
//             const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
//             if (!permissionResult.granted) {
//                 Alert.alert('Permission Refusée', 'L\'accès à la galerie est nécessaire.');
//                 return;
//             }

//             const result = await ImagePicker.launchImageLibraryAsync({
//                 mediaTypes: ImagePicker.MediaTypeOptions.Images,
//                 allowsEditing: false, // Garder false pour les documents officiels
//                 quality: 0.7, // Qualité légèrement réduite pour l'upload
//                 // base64: true // Peut être utile si la lecture URI échoue systématiquement
//             });

//             console.log('[pickDocument] Result:', result);

//             if (result.canceled) {
//                 console.log('[pickDocument] User cancelled.');
//                 return;
//             }

//             if (result.assets && result.assets.length > 0) {
//                 const asset = result.assets[0];
//                 // Vérification taille fichier (optionnel, ex: max 5MB)
//                 if (asset.fileSize && asset.fileSize > 5 * 1024 * 1024) {
//                     Alert.alert('Fichier trop volumineux', 'Veuillez choisir une image de moins de 5 Mo.');
//                     return;
//                 }
//                 console.log(`[pickImage] Picked for ${side}:`, asset.fileName, asset.uri, asset.mimeType, asset.fileSize);
//                 if (side === 'front') setSelectedFileFront(asset);
//                 else if (side === 'back') setSelectedFileBack(asset);
//                 else if (side === 'face') setSelectedFaceFile(asset);
//             } else {
//                 console.log('[pickImage] No assets found.');
//                 setError(`Aucune image sélectionnée.`);
//             }
//         } catch (err: any) {
//             console.error(`[pickDocument] Error for ${side}:`, err);
//             setError(`Erreur sélection image ${side}: ${err.message}`);
//             Alert.alert('Erreur', `Impossible de sélectionner l'image ${side}: ${err.message}`);
//         }
//     };

//     // --- Fonction Upload Corrigée ---
//     const uploadFile = async (
//         file: ImagePickerAsset,
//         // Le pathPrefix ici détermine le dossier *logique* (ex: 'user-faces')
//         pathPrefix: string
//     ): Promise<string> => {
//         // Nom de base pour le fichier (si fileName est null)
//         const originalFileName = file.fileName ?? `${pathPrefix}_${Date.now()}`;
//         console.log(`[uploadFile] Uploading ${pathPrefix}: ${originalFileName} from URI: ${file.uri}`);

//         if (!file.uri || !user?.id) {
//             throw new Error(`Infos utilisateur ou URI manquante pour ${pathPrefix}`);
//         }

//         try {
//             const fileExt = originalFileName.split('.').pop()?.toLowerCase() ?? 'jpg';
//             // Crée un nom de fichier unique et informatif
//             const fileName = `${user.id}-${pathPrefix}-${Date.now()}.${fileExt}`;

//             // --- CORRECTION DU CHEMIN DE STOCKAGE ---
//             // Ne pas ajouter le dossier parent 'identity-documents' au chemin
//             // car 'from' spécifie déjà le bucket
//             const filePath = `${pathPrefix}/${fileName}`;
//             // Exemple: filePath sera "document-front/xyz.jpg"
//             console.log(`[uploadFile] Constructed filePath for storage: ${filePath}`); // Log important
//             // --------------------------------------

//             let fileData: string | null = null; // Pour stocker le base64 si nécessaire
//             let blob: Blob | null = null;
//             const contentType = file.mimeType ?? `image/${fileExt === 'png' ? 'png' : 'jpeg'}`;

//             // Essayer de lire le fichier
//             try {
//                  if (Platform.OS === 'web') {
//                     console.log(`[uploadFile] Using web fetch for ${pathPrefix}`);
//                     const response = await fetch(file.uri);
//                     if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
//                     blob = await response.blob();
//                  } else {
//                     console.log(`[uploadFile] Using native FileSystem for ${pathPrefix}`);
//                     // S'assurer que l'URI est accessible
//                     const fileInfo = await FileSystem.getInfoAsync(file.uri);
//                     if (!fileInfo.exists) {
//                         throw new Error(`Le fichier local n'existe pas à l'URI: ${file.uri}`);
//                     }
//                     console.log(`[uploadFile] Native file info for ${file.uri}:`, fileInfo);
//                     fileData = await FileSystem.readAsStringAsync(file.uri, {
//                         encoding: FileSystem.EncodingType.Base64,
//                     });
//                     blob = base64ToBlob(fileData, contentType);
//                  }
//             } catch (readError: any) {
//                  console.error(`[uploadFile] Error reading file (${Platform.OS}) for ${pathPrefix}:`, readError);
//                  throw new Error(`Erreur lecture fichier (${pathPrefix}): ${readError.message}`);
//             }

//              if (!blob) {
//                  throw new Error(`Impossible de créer un Blob pour le fichier ${pathPrefix}`);
//              }

//              console.log(`[uploadFile] Blob created for ${pathPrefix}, size: ${blob.size}, type: ${blob.type}. Uploading...`);

//             // Upload vers Supabase storage avec le chemin corrigé
//             const { data: uploadData, error: storageError } = await supabase.storage
//                 .from('identity-documents') // <- Nom du Bucket
//                 .upload(filePath, blob, { // <- Utilise le filePath corrigé (sans le préfixe "identity-documents/")
//                     contentType: contentType,
//                     cacheControl: '3600', // Cache pour 1 heure
//                     upsert: false, // Ne pas écraser si le fichier existe déjà (improbable avec timestamp)
//                 });

//             if (storageError) {
//                 console.error(`[uploadFile] Supabase Storage Error (${filePath}):`, storageError);
//                 throw storageError; // Propage l'erreur Supabase
//             }

//             console.log(`[uploadFile] Upload Success (${pathPrefix}). Path stored:`, uploadData?.path);
//             setUploadProgress(prev => Math.min(prev + 1 / 3, 1)); // Met à jour la progression (1/3 par fichier)

//             // Retourne le chemin complet qui a été utilisé (important pour la BDD)
//             return uploadData?.path ?? filePath; // uploadData.path est la source de vérité

//         } catch (err: any) {
//             // Gestion d'erreur améliorée
//             console.error(`[uploadFile] Overall Error (${pathPrefix}):`, err);
//             let displayMessage = `Upload échoué (${pathPrefix}): ${err.message}`;
//             if (err.message?.includes('Bucket not found')) {
//                 displayMessage = `Erreur Configuration: Bucket 'identity-documents' introuvable. Vérifiez le nom.`;
//             } else if (err.message?.includes('mime type') || err.message?.includes('content-type')) {
//                 displayMessage = `Erreur: Type de fichier non autorisé (${contentType}).`;
//             } else if (err.message?.includes(' RLS policy')) {
//                  displayMessage = `Erreur Permissions: Impossible d'uploader dans le bucket. Vérifiez les policies Storage.`;
//             }
//             throw new Error(displayMessage);
//         }
//     };
//     // --- Fin Fonction Upload Corrigée ---

//     const handleSubmit = async () => {
//         setLoading(true);
//         setError(null);
//         setUploadProgress(0); // Reset la progression
//         console.log('[handleSubmit] Submitting verification...');

//         // Variables pour stocker les chemins, initialisées à null
//         let filePathFront: string | null = null;
//         let filePathBack: string | null = null;
//         let filePathFace: string | null = null;

//         try {
//             if (!user) throw new Error('Vous devez être connecté');
//             if (!documentNumber.trim()) throw new Error('Le numéro de document est requis');
//             if (!selectedFileFront) throw new Error('Le recto du document est requis');
//             if (!selectedFileBack) throw new Error('Le verso du document est requis');
//             if (!selectedFaceFile) throw new Error('La photo du visage est requise');

//             // Uploader chaque fichier séquentiellement pour mieux gérer les erreurs et la progression
//             console.log('[handleSubmit] Uploading front...');
//             filePathFront = await uploadFile(selectedFileFront, 'document-front');

//             console.log('[handleSubmit] Uploading back...');
//             filePathBack = await uploadFile(selectedFileBack, 'document-back');

//             console.log('[handleSubmit] Uploading face...');
//             filePathFace = await uploadFile(selectedFaceFile, 'user-faces');

//             console.log('[handleSubmit] All files uploaded successfully. Submitting details to DB...');
//             setUploadProgress(1); // Marquer comme 100%

//             // Vérifier d'abord s'il existe déjà une vérification pour ce niveau
//             const { data: existingVerifications, error: fetchError } = await supabase
//                 .from('identity_verifications')
//                 .select('*')
//                 .eq('user_id', user.id)
//                 .eq('verification_level', 2) // Même niveau que celui utilisé pour l'insertion
//                 .in('status', ['rejected', 'pending']); // Chercher les vérifications rejetées ou en attente
            
//             if (fetchError) {
//                 console.error('[handleSubmit] Error fetching existing verifications:', fetchError);
//                 throw fetchError;
//             }

//             let result;
            
//             if (existingVerifications && existingVerifications.length > 0) {
//                 // Mettre à jour la vérification existante au lieu d'en créer une nouvelle
//                 console.log('[handleSubmit] Updating existing verification:', existingVerifications[0].id);
//                 result = await supabase
//                     .from('identity_verifications')
//                     .update({
//                         document_type: documentType,
//                         document_number: documentNumber.trim().toUpperCase(),
//                         status: 'pending',
//                         document_front_path: filePathFront,
//                         document_back_path: filePathBack,
//                         user_face_path: filePathFace,
//                         rejection_reason: null, // Effacer la raison précédente
//                         verified_by: null,      // Effacer l'admin qui a vérifié
//                         verified_at: null,      // Effacer la date de vérification
//                         updated_at: new Date().toISOString() // Mettre à jour la date
//                     })
//                     .eq('id', existingVerifications[0].id)
//                     .select();
//             } else {
//                 // Créer une nouvelle vérification s'il n'en existe pas déjà une
//                 console.log('[handleSubmit] Creating new verification');
//                 result = await supabase
//                     .from('identity_verifications')
//                     .insert({
//                         user_id: user.id,
//                         document_type: documentType,
//                         document_number: documentNumber.trim().toUpperCase(),
//                         verification_level: 2, // Ou le niveau approprié
//                         status: 'pending',
//                         document_front_path: filePathFront,
//                         document_back_path: filePathBack,
//                         user_face_path: filePathFace,
//                     })
//                     .select();
//             }

//             if (result.error) {
//                 console.error('[handleSubmit] DB Submit Error:', result.error);
//                 throw result.error;
//             }

//             console.log('[handleSubmit] Verification submitted successfully. DB Data:', result.data);
            
//             // AJOUT IMPORTANT: Rafraîchir le statut de vérification dans le contexte d'authentification
//             await refreshVerificationStatus();
//             console.log('[handleSubmit] Verification status refreshed');
            
//             Alert.alert('Succès', 'Vos documents ont été soumis pour vérification.');
//             router.replace('/profile/'); // Rediriger vers le profil ou une page de confirmation

//         } catch (err: any) {
//             console.error('[handleSubmit] Error during submission process:', err);
//             // Afficher l'erreur spécifique remontée par uploadFile ou l'insertion DB
//             setError(err.message || 'Une erreur est survenue lors de la soumission.');
//             Alert.alert('Erreur de soumission', err.message || 'Une erreur est survenue.');
//         } finally {
//             setLoading(false);
//             // Ne pas reset la progression ici pour que l'utilisateur voie 100% ou l'erreur
//         }
//     };

//     const getTruncatedFileName = (file: ImagePickerAsset | null): string => {
//         if (!file || !file.fileName) return 'Fichier sélectionné'; // Texte par défaut si pas de nom
//         const name = file.fileName;
//         // Tronquer si plus long que 25 caractères
//         return name.length > 25 ? `${name.substring(0, 22)}...` : name;
//     }

//     // --- Rendu JSX ---
//     if (!fontsLoaded && !fontError) {
//         return <SafeAreaView style={styles.loadingContainer}><ActivityIndicator size="large" color="#0891b2" /></SafeAreaView>;
//     }
//      if (fontError) {
//         return <SafeAreaView style={styles.loadingContainer}><Text style={styles.errorText}>Erreur chargement polices.</Text></SafeAreaView>;
//     }

//     return (
//         <SafeAreaView style={styles.container}>
//             <Stack.Screen options={{ headerShown: false }} />
//             {/* Header */}
//             <View style={styles.header}>
//                 <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
//                     <ChevronLeft size={24} color="#1e293b" />
//                 </TouchableOpacity>
//                 <Text style={styles.headerTitle}>Vérifier votre identité</Text>
//                 <View style={{ width: 40 }} /> {/* Spacer */}
//             </View>

//             <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
//                 <Animated.View entering={FadeIn.delay(100)} style={styles.section}>

//                     {/* Etape 1: Infos */}
//                     <Text style={styles.title}>Étape 1: Informations</Text>
//                     <Text style={styles.subtitle}>Sélectionnez le type et entrez le numéro.</Text>
//                     {/* Type de document */}
//                     <View style={styles.documentTypes}>
//                          <TouchableOpacity
//                             style={[styles.documentOption, documentType === 'cin' && styles.documentOptionSelected]}
//                             onPress={() => setDocumentType('cin')} disabled={loading} >
//                             <Card size={28} color={documentType === 'cin' ? '#ffffff' : '#0891b2'} />
//                             <Text style={[styles.documentOptionText, documentType === 'cin' && styles.documentOptionTextSelected]}>
//                                 Carte d'identité
//                             </Text>
//                         </TouchableOpacity>
//                          <TouchableOpacity
//                             style={[styles.documentOption, documentType === 'passport' && styles.documentOptionSelected]}
//                              onPress={() => setDocumentType('passport')} disabled={loading} >
//                              <Passport size={28} color={documentType === 'passport' ? '#ffffff' : '#0891b2'} />
//                              <Text style={[styles.documentOptionText, documentType === 'passport' && styles.documentOptionTextSelected]}>
//                                 Passeport
//                              </Text>
//                          </TouchableOpacity>
//                     </View>
//                     {/* Numéro */}
//                     <View style={styles.inputGroup}>
//                         <Text style={styles.label}>Numéro du document</Text>
//                         <TextInput
//                             style={styles.input} value={documentNumber} onChangeText={setDocumentNumber}
//                             placeholder={documentType === 'cin' ? "Ex: AB123456" : "Ex: XY1234567"}
//                             placeholderTextColor="#94a3b8" autoCapitalize="characters" />
//                     </View>

//                      {/* Etape 2: Upload */}
//                     <Text style={styles.title}>Étape 2: Télécharger</Text>
//                     <Text style={styles.subtitle}>Recto, verso et une photo de vous.</Text>

//                     {/* Upload Recto */}
//                      <TouchableOpacity
//                          style={[styles.uploadButton, selectedFileFront ? styles.uploadButtonSelected : styles.uploadButtonIdle]}
//                          onPress={() => pickDocument('front')} disabled={loading} >
//                          {selectedFileFront ? <CheckCircle size={20} color="#15803d" style={styles.uploadButtonIcon} /> : <UploadCloud size={20} color="#475569" style={styles.uploadButtonIcon} />}
//                          <Text style={[styles.uploadButtonText, selectedFileFront && styles.uploadButtonTextSelected]}>
//                              {selectedFileFront ? `${getTruncatedFileName(selectedFileFront)}` : 'Sélectionner le recto'}
//                          </Text>
//                      </TouchableOpacity>
//                      {selectedFileFront?.uri && ( <Image source={{ uri: selectedFileFront.uri }} style={styles.previewImage} resizeMode="contain" /> )}

//                     {/* Upload Verso */}
//                      <TouchableOpacity
//                          style={[styles.uploadButton, selectedFileBack ? styles.uploadButtonSelected : styles.uploadButtonIdle]}
//                          onPress={() => pickDocument('back')} disabled={loading} >
//                          {selectedFileBack ? <CheckCircle size={20} color="#15803d" style={styles.uploadButtonIcon} /> : <UploadCloud size={20} color="#475569" style={styles.uploadButtonIcon} />}
//                          <Text style={[styles.uploadButtonText, selectedFileBack && styles.uploadButtonTextSelected]}>
//                              {selectedFileBack ? `${getTruncatedFileName(selectedFileBack)}` : 'Sélectionner le verso'}
//                          </Text>
//                      </TouchableOpacity>
//                     {selectedFileBack?.uri && ( <Image source={{ uri: selectedFileBack.uri }} style={styles.previewImage} resizeMode="contain" /> )}

//                     {/* Upload Visage */}
//                     <TouchableOpacity
//                          style={[styles.uploadButton, selectedFaceFile ? styles.uploadButtonSelected : styles.uploadButtonIdle]}
//                          onPress={() => pickDocument('face')} disabled={loading} >
//                          {selectedFaceFile ? <CheckCircle size={20} color="#15803d" style={styles.uploadButtonIcon} /> : <UploadCloud size={20} color="#475569" style={styles.uploadButtonIcon} />}
//                          <Text style={[styles.uploadButtonText, selectedFaceFile && styles.uploadButtonTextSelected]}>
//                              {selectedFaceFile ? `${getTruncatedFileName(selectedFaceFile)}` : 'Sélectionner une photo de vous :  Votre pièce d\'identité doit apparaitre clairement ainsi que votre visage !'}
//                          </Text>
//                      </TouchableOpacity>
//                     {selectedFaceFile?.uri && ( <Image source={{ uri: selectedFaceFile.uri }} style={styles.previewImage} resizeMode="contain" /> )}

//                     {/* Barre de progression */}
//                      {loading && uploadProgress > 0 && ( // Afficher dès le début de l'upload
//                         <View style={styles.progressContainer}>
//                              <Text style={styles.progressLabel}>Upload en cours...</Text>
//                             <View style={styles.progressBarBackground}>
//                                  <Animated.View style={[styles.progressBarFill, { width: `${uploadProgress * 100}%` }]} />
//                             </View>
//                             <Text style={styles.progressPercentage}>{Math.round(uploadProgress * 100)}%</Text>
//                          </View>
//                     )}

//                     {/* Affichage Erreur */}
//                     {error && ( <View style={styles.errorDisplay}><Text style={styles.errorText}>{error}</Text></View> )}

//                     {/* Carte Info */}
//                     <View style={styles.infoCard}>
//                         <Info size={20} color="#0891b2" />
//                         <View>
//                              <Text style={styles.infoTitle}>Pourquoi cette vérification ?</Text>
//                              <Text style={styles.infoText}>Pour la sécurité, prévenir la fraude, établir la confiance et respecter les obligations légales.</Text>
//                          </View>
//                     </View>

//                 </Animated.View>
//             </ScrollView>

//             {/* Footer Bouton Soumettre */}
//             <View style={styles.footer}>
//                  <TouchableOpacity
//                     style={[styles.submitButton, (loading || !selectedFileFront || !selectedFileBack || !selectedFaceFile || !documentNumber.trim()) && styles.submitButtonDisabled]}
//                     onPress={handleSubmit}
//                     disabled={loading || !selectedFileFront || !selectedFileBack || !selectedFaceFile || !documentNumber.trim()} >
//                      {loading ? (
//                          <ActivityIndicator color="#ffffff" />
//                      ) : (
//                         <Text style={styles.submitButtonText}>Soumettre pour vérification</Text>
//                      )}
//                  </TouchableOpacity>
//             </View>
//         </SafeAreaView>
//     );
// }

// // --- Styles ---
// const styles = StyleSheet.create({
//     container: { flex: 1, backgroundColor: '#f8fafc' }, // Fond légèrement gris
//     loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' },
//     header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, paddingTop: Platform.OS === 'android' ? 30 : 50, backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
//     backButton: { padding: 8 }, // Simplifié
//     headerTitle: { fontFamily: 'Montserrat-Bold', fontSize: 18, color: '#1e293b', flex: 1, textAlign: 'center', marginLeft: -40 /* Compenser le bouton retour */ },
//     content: { flex: 1 },
//     section: { paddingHorizontal: 20, paddingVertical: 10 },
//     title: { fontFamily: 'Montserrat-Bold', fontSize: 20, color: '#1e293b', marginBottom: 6, marginTop: 20 },
//     subtitle: { fontFamily: 'Montserrat-Regular', fontSize: 14, color: '#64748b', marginBottom: 20 },
//     documentTypes: { gap: 12, marginBottom: 24 },
//     documentOption: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#ffffff', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0' },
//     documentOptionSelected: { backgroundColor: '#0891b2', borderColor: '#0891b2' },
//     documentOptionText: { fontFamily: 'Montserrat-SemiBold', fontSize: 15, color: '#334155', flexShrink: 1 /* Permet au texte de passer à la ligne si besoin */ },
//     documentOptionTextSelected: { color: '#ffffff' },
//     inputGroup: { gap: 6, marginBottom: 20 },
//     label: { fontFamily: 'Montserrat-SemiBold', fontSize: 14, color: '#334155' },
//     input: { fontFamily: 'Montserrat-Regular', fontSize: 16, color: '#1e293b', backgroundColor: '#ffffff', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 8, borderWidth: 1, borderColor: '#cbd5e1' },
//     uploadButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16, borderRadius: 8, marginBottom: 8, borderWidth: 1 },
//     uploadButtonIdle: { backgroundColor: '#f1f5f9', borderColor: '#e2e8f0' },
//     uploadButtonSelected: { backgroundColor: '#dcfce7', borderColor: '#86efac' }, // Vert clair pour sélectionné
//     uploadButtonIcon: { marginRight: 10 },
//     uploadButtonText: { fontFamily: 'Montserrat-SemiBold', fontSize: 14, color: '#475569', flexShrink: 1 },
//     uploadButtonTextSelected: { color: '#15803d' }, // Texte vert foncé
//     previewImage: { width: 80, height: 60, borderRadius: 6, marginTop: 0, marginBottom: 16, alignSelf: 'flex-start', borderWidth: 1, borderColor: '#e5e7eb' },
//     progressContainer: { marginTop: 16, marginBottom: 16 },
//     progressLabel: { fontFamily: 'Montserrat-Regular', fontSize: 12, color: '#64748b', marginBottom: 4 },
//     progressBarBackground: { height: 8, backgroundColor: '#e5e7eb', borderRadius: 4, overflow: 'hidden' },
//     progressBarFill: { height: '100%', backgroundColor: '#059669', borderRadius: 4 },
//     progressPercentage: { fontFamily: 'Montserrat-SemiBold', fontSize: 12, color: '#4b5563', marginTop: 4, textAlign: 'right' },
//     errorDisplay: { backgroundColor: '#fee2e2', padding: 12, borderRadius: 8, marginTop: 10, marginBottom: 20, borderWidth: 1, borderColor: '#fecaca' },
//     errorText: { fontFamily: 'Montserrat-Regular', fontSize: 14, color: '#dc2626', textAlign: 'center' },
//     infoCard: { flexDirection: 'row', backgroundColor: '#f0f9ff', padding: 16, borderRadius: 12, gap: 12, alignItems: 'flex-start', marginTop: 20, borderWidth: 1, borderColor: '#e0f2fe' },
//     infoTitle: { fontFamily: 'Montserrat-SemiBold', fontSize: 15, color: '#0369a1', marginBottom: 4 },
//     infoText: { fontFamily: 'Montserrat-Regular', fontSize: 13, color: '#334155', lineHeight: 18 },
//     footer: { padding: 16, backgroundColor: '#ffffff', borderTopWidth: 1, borderTopColor: '#e5e7eb' },
//     submitButton: { backgroundColor: '#059669', paddingVertical: 16, borderRadius: 10, alignItems: 'center' },
//     submitButtonDisabled: { backgroundColor: '#9ca3af', opacity: 0.7 },
//     submitButtonText: { fontFamily: 'Montserrat-SemiBold', fontSize: 16, color: '#ffffff' },
// });




// Dans app/profile/verify.tsx
// VERSION COMPLÈTE ET CORRECTE (handleSubmit corrigé)

import React, { useState, useEffect, useCallback } from 'react'; // useCallback ajouté
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Platform,
    ActivityIndicator, Image, Alert, SafeAreaView,
} from 'react-native';
import {
    useFonts,
    Montserrat_700Bold,
    Montserrat_600SemiBold,
    Montserrat_400Regular,
} from '@expo-google-fonts/montserrat';
import {
    ChevronLeft, CreditCard as Card, Upload as PassportIcon, // Utilisation de l'alias
    CheckCircle, UploadCloud, Info,
} from 'lucide-react-native';
import { router, SplashScreen, Stack } from 'expo-router';
import { supabase } from '@/lib/supabase'; // Vérifier chemin
import { useAuth } from '@/hooks/useAuth'; // Vérifier chemin
import Animated, { FadeIn } from 'react-native-reanimated';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { Buffer } from 'buffer';

// Polyfills (si nécessaire pour votre environnement)
if (typeof global.atob === 'undefined') {
    global.atob = (data) => Buffer.from(data, 'base64').toString('binary');
}
if (typeof global.Blob === 'undefined') {
     // Polyfill minimaliste pour Blob
     global.Blob = class Blob {
         _buffer: Buffer;
         _options: { type: string };
         size: number;
         type: string;
         constructor(parts: (Buffer | string | Blob)[], options?: { type: string }) {
             const buffers = parts.map(part => { /* ... (comme avant) ... */ return Buffer.from(String(part)); });
             this._buffer = Buffer.concat(buffers); this._options = { type: options?.type || '' };
             this.size = this._buffer.length; this.type = this._options.type;
         }
     } as any;
}

type ImagePickerAsset = ImagePicker.ImagePickerAsset;

// SplashScreen.preventAutoHideAsync(); // Normalement géré dans _layout

type DocumentType = 'cin' | 'passport';

export default function VerifyIdentityScreen() {
    // Ajout de refreshVerificationStatus depuis useAuth
    const { user, refreshVerificationStatus } = useAuth(); // Assurez-vous que refresh est bien dans useAuth
    const [documentType, setDocumentType] = useState<DocumentType>('cin');
    const [documentNumber, setDocumentNumber] = useState('');
    const [selectedFileFront, setSelectedFileFront] = useState<ImagePickerAsset | null>(null);
    const [selectedFileBack, setSelectedFileBack] = useState<ImagePickerAsset | null>(null);
    const [selectedFaceFile, setSelectedFaceFile] = useState<ImagePickerAsset | null>(null);
    const [loading, setLoading] = useState(false); // Pour le processus global de soumission/upload
    const [error, setError] = useState<string | null>(null);
    const [uploadProgress, setUploadProgress] = useState<number>(0); // Progression totale (0 à 1)

    const [fontsLoaded, fontError] = useFonts({
        'Montserrat-Bold': Montserrat_700Bold,
        'Montserrat-SemiBold': Montserrat_600SemiBold,
        'Montserrat-Regular': Montserrat_400Regular,
    });

    useEffect(() => {
        if (fontsLoaded || fontError) { SplashScreen.hideAsync(); }
    }, [fontsLoaded, fontError]);

    // Helper function base64ToBlob
    const base64ToBlob = (base64: string, contentType: string): Blob => {
        try {
            const byteCharacters = atob(base64); const byteArrays = [];
            for (let offset = 0; offset < byteCharacters.length; offset += 512) {
                const slice = byteCharacters.slice(offset, offset + 512); const byteNumbers = new Array(slice.length);
                for (let i = 0; i < slice.length; i++) { byteNumbers[i] = slice.charCodeAt(i); }
                const byteArray = new Uint8Array(byteNumbers); byteArrays.push(byteArray);
            } return new Blob(byteArrays, { type: contentType });
        } catch (e) { console.error("Error in base64ToBlob:", e); throw new Error("Conversion base64 échouée."); }
    };

    // Fonction pickDocument
    const pickDocument = async (side: 'front' | 'back' | 'face') => {
        console.log(`[pickDocument] Picking for: ${side}`); setError(null);
        try {
            const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!permissionResult.granted) { Alert.alert('Permission Refusée', "L'accès galerie est requis."); return; }
            const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: false, quality: 0.7 });
            if (result.canceled) { console.log('[pickDocument] Cancelled.'); return; }
            if (result.assets && result.assets.length > 0) {
                const asset = result.assets[0];
                if (asset.fileSize && asset.fileSize > 5 * 1024 * 1024) { Alert.alert('Fichier trop lourd', 'Max 5 Mo.'); return; }
                console.log(`[pickImage] Picked for ${side}: ${asset.fileName}`);
                if (side === 'front') setSelectedFileFront(asset); else if (side === 'back') setSelectedFileBack(asset); else if (side === 'face') setSelectedFaceFile(asset);
            } else { console.log('[pickImage] No assets.'); setError(`Aucune image sélectionnée.`); }
        } catch (err: any) { console.error(`[pickDocument] Error ${side}:`, err); setError(`Erreur sélection ${side}: ${err.message}`); Alert.alert('Erreur', `Sélection échouée: ${err.message}`); }
    };

    // Fonction uploadFile
    const uploadFile = async (file: ImagePickerAsset, pathPrefix: string): Promise<string> => {
        const originalFileName = file.fileName ?? `${pathPrefix}_${Date.now()}`;
        console.log(`[uploadFile] Uploading ${pathPrefix}: ${originalFileName}`);
        if (!file.uri || !user?.id) { throw new Error(`User/URI manquant pour ${pathPrefix}`); }
        try {
            const fileExt = originalFileName.split('.').pop()?.toLowerCase() ?? 'jpg';
            const fileName = `${user.id}-${pathPrefix}-${Date.now()}.${fileExt}`;
            const filePath = `${pathPrefix}/${fileName}`; // Chemin SANS le nom du bucket
            console.log(`[uploadFile] Storage path: ${filePath}`);
            let blob: Blob | null = null;
            const contentType = file.mimeType ?? `image/${fileExt}`;
            try { // Lecture Fichier
                if (Platform.OS === 'web') {
                    const response = await fetch(file.uri); if (!response.ok) throw new Error(`HTTP error! ${response.status}`); blob = await response.blob();
                } else {
                    const fileInfo = await FileSystem.getInfoAsync(file.uri); if (!fileInfo.exists) throw new Error(`Fichier inexistant: ${file.uri}`);
                    const fileData = await FileSystem.readAsStringAsync(file.uri, { encoding: FileSystem.EncodingType.Base64 }); blob = base64ToBlob(fileData, contentType);
                }
            } catch (readError: any) { throw new Error(`Erreur lecture (${Platform.OS}): ${readError.message}`); }
            if (!blob) { throw new Error(`Création Blob échouée`); }
            console.log(`[uploadFile] Blob created, size: ${blob.size}. Uploading...`);
            // Upload Supabase
            const { data: uploadData, error: storageError } = await supabase.storage.from('identity-documents').upload(filePath, blob, { contentType: contentType, cacheControl: '3600', upsert: false });
            if (storageError) { console.error(`[uploadFile] Storage Error:`, storageError); throw storageError; }
            console.log(`[uploadFile] Success (${pathPrefix}). Path:`, uploadData?.path);
            setUploadProgress(prev => Math.min(prev + 1 / 3, 1));
            return uploadData?.path ?? filePath; // Retourne le chemin retourné par Supabase si disponible
        } catch (err: any) {
            console.error(`[uploadFile] Error (${pathPrefix}):`, err);
            let displayMessage = `Upload échoué (${pathPrefix}): ${err.message}`;
            if (err.message?.includes('Bucket not found')) displayMessage = `Erreur Config: Bucket introuvable.`;
            else if (err.message?.includes('mime type')) displayMessage = `Erreur: Type fichier non autorisé.`;
            else if (err.message?.includes('RLS policy')) displayMessage = `Erreur Permissions: Upload impossible. Vérifiez policies Storage.`;
            throw new Error(displayMessage);
        }
    };

    // --- handleSubmit (Logique DB Corrigée) ---
    const handleSubmit = async () => {
        setLoading(true); setError(null); setUploadProgress(0);
        console.log('[handleSubmit] Submitting verification...');
        let filePathFront: string | null = null, filePathBack: string | null = null, filePathFace: string | null = null;

        try {
            // Vérifications initiales
            if (!user) throw new Error('Vous devez être connecté');
            if (!documentNumber.trim()) throw new Error('Le numéro de document est requis');
            if (!selectedFileFront) throw new Error('Le recto du document est requis');
            if (!selectedFileBack) throw new Error('Le verso du document est requis');
            if (!selectedFaceFile) throw new Error('La photo du visage est requise');

            // Upload des fichiers
            console.log('[handleSubmit] Uploading files...');
            filePathFront = await uploadFile(selectedFileFront, 'document-front');
            filePathBack = await uploadFile(selectedFileBack, 'document-back');
            filePathFace = await uploadFile(selectedFaceFile, 'user-faces');
            console.log('[handleSubmit] Files uploaded. Checking/Updating DB record...');
            setUploadProgress(1);

            // Trouver la DERNIÈRE vérification existante (rejected ou pending) pour ce niveau
            const verificationLevelToSubmit = 2; // Ou récupérez dynamiquement si nécessaire
            const { data: latestExistingVerification, error: fetchError } = await supabase
                .from('identity_verifications')
                .select('id, status')
                .eq('user_id', user.id)
                .eq('verification_level', verificationLevelToSubmit)
                .in('status', ['rejected', 'pending'])
                .order('created_at', { ascending: false }) // Trier par date DESC
                .limit(1)
                .maybeSingle(); // Récupérer 0 ou 1 ligne

            if (fetchError) {
                console.error('[handleSubmit] Error fetching existing verification:', fetchError);
                throw new Error("Erreur lors de la vérification de l'historique.");
            }

            let result;
            // CAS 1 : Mettre à jour la vérification existante trouvée
            if (latestExistingVerification) {
                console.log(`[handleSubmit] Updating existing verification ID: ${latestExistingVerification.id}, current status: ${latestExistingVerification.status}`);
                result = await supabase
                    .from('identity_verifications')
                    .update({
                        document_type: documentType,
                        document_number: documentNumber.trim().toUpperCase(),
                        status: 'pending',                  // <<< STATUT PENDING
                        document_front_path: filePathFront,
                        document_back_path: filePathBack,
                        user_face_path: filePathFace,
                        rejection_reason: null,            // <<< Effacer
                        verified_by: null,                 // <<< Effacer
                        verified_at: null,                 // <<< Effacer
                        updated_at: new Date().toISOString() // <<< MAJ Date
                    })
                    .eq('id', latestExistingVerification.id) // Cible la bonne ligne
                    .select('id'); // Juste pour confirmation
            }
            // CAS 2 : Créer une nouvelle vérification
            else {
                console.log('[handleSubmit] Creating new verification record');
                result = await supabase
                    .from('identity_verifications')
                    .insert({
                        user_id: user.id,
                        document_type: documentType,
                        document_number: documentNumber.trim().toUpperCase(),
                        verification_level: verificationLevelToSubmit,
                        status: 'pending',      // <<< STATUT PENDING
                        document_front_path: filePathFront,
                        document_back_path: filePathBack,
                        user_face_path: filePathFace,
                    })
                    .select('id'); // Juste pour confirmation
            }

            // Vérifier l'erreur DB
            if (result.error) { console.error('[handleSubmit] DB Submit/Update Error:', result.error); throw result.error; }
            if (!result.data || result.data.length === 0) { console.warn('[handleSubmit] DB operation success but no data returned.'); }

            console.log('[handleSubmit] Verification submitted/updated successfully. Result:', result.data);

            // Rafraîchir le statut dans le contexte Auth
            if (refreshVerificationStatus) {
                await refreshVerificationStatus();
                console.log('[handleSubmit] Verification status refreshed via useAuth');
            } else { console.warn("[handleSubmit] refreshVerificationStatus function not found!"); }

            Alert.alert('Succès', 'Vos documents ont été soumis pour vérification.');
            router.replace('/(tabs)/profile'); // Naviguer vers le profil onglet

        } catch (err: any) {
            console.error('[handleSubmit] Error during submission process:', err);
            setError(err.message || 'Une erreur est survenue lors de la soumission.');
            Alert.alert('Erreur de soumission', err.message || 'Une erreur est survenue.');
        } finally {
            setLoading(false);
            // Optionnel: setUploadProgress(0);
        }
    };
    // --- Fin handleSubmit ---

    // Fonction getTruncatedFileName (inchangée)
    const getTruncatedFileName = (file: ImagePickerAsset | null): string => {
         if (!file || !file.fileName) return 'Fichier sélectionné';
         const name = file.fileName;
         return name.length > 25 ? `${name.substring(0, 22)}...` : name;
    };

    // --- Rendu JSX ---
    if (!fontsLoaded && !fontError) { return <SafeAreaView style={styles.loadingContainer}><ActivityIndicator size="large" color="#0891b2" /></SafeAreaView>; }
    if (fontError) { return <SafeAreaView style={styles.loadingContainer}><Text style={styles.errorText}>Erreur chargement polices.</Text></SafeAreaView>; }

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <ChevronLeft size={24} color="#1e293b" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Vérifier votre identité</Text>
                <View style={{ width: 40 }} />{/* Spacer */}
            </View>

            <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
                <Animated.View entering={FadeIn.delay(100)} style={styles.section}>
                    {/* --- Étape 1: Infos --- */}
                     <Text style={styles.title}>Étape 1: Informations</Text>
                     <Text style={styles.subtitle}>Sélectionnez le type et entrez le numéro.</Text>
                     {/* Type Doc */}
                     <View style={styles.documentTypes}>
                          <TouchableOpacity style={[styles.documentOption, documentType === 'cin' && styles.documentOptionSelected]} onPress={() => setDocumentType('cin')} disabled={loading} >
                              <Card size={28} color={documentType === 'cin' ? '#ffffff' : '#0891b2'} />
                              <Text style={[styles.documentOptionText, documentType === 'cin' && styles.documentOptionTextSelected]}>Carte d'identité</Text>
                          </TouchableOpacity>
                          <TouchableOpacity style={[styles.documentOption, documentType === 'passport' && styles.documentOptionSelected]} onPress={() => setDocumentType('passport')} disabled={loading} >
                               <PassportIcon size={28} color={documentType === 'passport' ? '#ffffff' : '#0891b2'} />
                               <Text style={[styles.documentOptionText, documentType === 'passport' && styles.documentOptionTextSelected]}>Passeport</Text>
                           </TouchableOpacity>
                     </View>
                     {/* Numéro Doc */}
                     <View style={styles.inputGroup}>
                         <Text style={styles.label}>Numéro du document</Text>
                         <TextInput style={styles.input} value={documentNumber} onChangeText={setDocumentNumber} placeholder={documentType === 'cin' ? "Ex: AB123456" : "Ex: XY1234567"} placeholderTextColor="#94a3b8" autoCapitalize="characters" />
                     </View>

                    {/* --- Étape 2: Upload --- */}
                    <Text style={styles.title}>Étape 2: Télécharger</Text>
                    <Text style={styles.subtitle}>Recto, verso et une photo de vous tenant la pièce d'identité.</Text>
                    {/* Upload Recto */}
                     <TouchableOpacity style={[styles.uploadButton, selectedFileFront ? styles.uploadButtonSelected : styles.uploadButtonIdle]} onPress={() => pickDocument('front')} disabled={loading} >
                         {selectedFileFront ? <CheckCircle size={20} color="#15803d" style={styles.uploadButtonIcon} /> : <UploadCloud size={20} color="#475569" style={styles.uploadButtonIcon} />}
                         <Text style={[styles.uploadButtonText, selectedFileFront && styles.uploadButtonTextSelected]}> {selectedFileFront ? `${getTruncatedFileName(selectedFileFront)}` : 'Sélectionner le recto'} </Text>
                     </TouchableOpacity>
                     {selectedFileFront?.uri && ( <Image source={{ uri: selectedFileFront.uri }} style={styles.previewImage} resizeMode="contain" /> )}
                    {/* Upload Verso */}
                     <TouchableOpacity style={[styles.uploadButton, selectedFileBack ? styles.uploadButtonSelected : styles.uploadButtonIdle]} onPress={() => pickDocument('back')} disabled={loading} >
                         {selectedFileBack ? <CheckCircle size={20} color="#15803d" style={styles.uploadButtonIcon} /> : <UploadCloud size={20} color="#475569" style={styles.uploadButtonIcon} />}
                         <Text style={[styles.uploadButtonText, selectedFileBack && styles.uploadButtonTextSelected]}> {selectedFileBack ? `${getTruncatedFileName(selectedFileBack)}` : 'Sélectionner le verso'} </Text>
                     </TouchableOpacity>
                     {selectedFileBack?.uri && ( <Image source={{ uri: selectedFileBack.uri }} style={styles.previewImage} resizeMode="contain" /> )}
                    {/* Upload Visage */}
                     <TouchableOpacity style={[styles.uploadButton, selectedFaceFile ? styles.uploadButtonSelected : styles.uploadButtonIdle]} onPress={() => pickDocument('face')} disabled={loading} >
                         {selectedFaceFile ? <CheckCircle size={20} color="#15803d" style={styles.uploadButtonIcon} /> : <UploadCloud size={20} color="#475569" style={styles.uploadButtonIcon} />}
                         <Text style={[styles.uploadButtonText, selectedFaceFile && styles.uploadButtonTextSelected]}> {selectedFaceFile ? `${getTruncatedFileName(selectedFaceFile)}` : 'Sélectionner photo (visage + pièce ID)'} </Text>
                     </TouchableOpacity>
                     {selectedFaceFile?.uri && ( <Image source={{ uri: selectedFaceFile.uri }} style={styles.previewImage} resizeMode="contain" /> )}

                    {/* --- Barre de progression --- */}
                     {loading && uploadProgress > 0 && (
                         <View style={styles.progressContainer}>
                             <Text style={styles.progressLabel}>Upload en cours...</Text>
                             <View style={styles.progressBarBackground}>
                                 <Animated.View style={[styles.progressBarFill, { width: `${uploadProgress * 100}%` }]} />
                             </View>
                             <Text style={styles.progressPercentage}>{Math.round(uploadProgress * 100)}%</Text>
                         </View>
                     )}
                    {/* --- Affichage Erreur --- */}
                    {error && ( <View style={styles.errorDisplay}><Text style={styles.errorText}>{error}</Text></View> )}
                    {/* --- Carte Info --- */}
                    <View style={styles.infoCard}>
                        <Info size={20} color="#0891b2" />
                        <View style={{flex: 1}}>{/* Pour que le texte wrap */}
                             <Text style={styles.infoTitle}>Pourquoi cette vérification ?</Text>
                             <Text style={styles.infoText}>Pour la sécurité de tous, prévenir la fraude, établir la confiance et respecter les obligations légales.</Text>
                         </View>
                    </View>

                </Animated.View>
            </ScrollView>

            {/* --- Footer Bouton Soumettre --- */}
            <View style={styles.footer}>
                 <TouchableOpacity
                     style={[styles.submitButton, (loading || !selectedFileFront || !selectedFileBack || !selectedFaceFile || !documentNumber.trim()) && styles.submitButtonDisabled]}
                     onPress={handleSubmit}
                     disabled={loading || !selectedFileFront || !selectedFileBack || !selectedFaceFile || !documentNumber.trim()} >
                     {loading ? ( <ActivityIndicator color="#ffffff" /> ) : ( <Text style={styles.submitButtonText}>Soumettre pour vérification</Text> )}
                 </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

// --- Styles ---
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, paddingTop: Platform.OS === 'android' ? 30 : 50, backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
    backButton: { padding: 8 },
    headerTitle: { fontFamily: 'Montserrat-Bold', fontSize: 18, color: '#1e293b', flex: 1, textAlign: 'center', marginLeft: -40 }, // Ajuster marginLeft si besoin
    content: { flex: 1 },
    section: { paddingHorizontal: 20, paddingVertical: 10 },
    title: { fontFamily: 'Montserrat-Bold', fontSize: 20, color: '#1e293b', marginBottom: 6, marginTop: 20 },
    subtitle: { fontFamily: 'Montserrat-Regular', fontSize: 14, color: '#64748b', marginBottom: 20, lineHeight: 20 },
    documentTypes: { gap: 12, marginBottom: 24 },
    documentOption: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#ffffff', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0' },
    documentOptionSelected: { backgroundColor: '#0891b2', borderColor: '#0891b2' },
    documentOptionText: { fontFamily: 'Montserrat-SemiBold', fontSize: 15, color: '#334155', flexShrink: 1 },
    documentOptionTextSelected: { color: '#ffffff' },
    inputGroup: { gap: 6, marginBottom: 20 },
    label: { fontFamily: 'Montserrat-SemiBold', fontSize: 14, color: '#334155' },
    input: { fontFamily: 'Montserrat-Regular', fontSize: 16, color: '#1e293b', backgroundColor: '#ffffff', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 8, borderWidth: 1, borderColor: '#cbd5e1', height: 50 }, // Hauteur fixe
    uploadButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16, borderRadius: 8, marginBottom: 8, borderWidth: 1, minHeight: 50 }, // minHeight
    uploadButtonIdle: { backgroundColor: '#f1f5f9', borderColor: '#e2e8f0' },
    uploadButtonSelected: { backgroundColor: '#dcfce7', borderColor: '#86efac' },
    uploadButtonIcon: { marginRight: 10 },
    uploadButtonText: { fontFamily: 'Montserrat-SemiBold', fontSize: 14, color: '#475569', flexShrink: 1 },
    uploadButtonTextSelected: { color: '#15803d' },
    previewImage: { width: 100, height: 75, borderRadius: 6, marginTop: 4, marginBottom: 16, alignSelf: 'flex-start', borderWidth: 1, borderColor: '#e5e7eb' }, // Taille preview augmentée
    progressContainer: { marginTop: 16, marginBottom: 16 },
    progressLabel: { fontFamily: 'Montserrat-Regular', fontSize: 12, color: '#64748b', marginBottom: 4 },
    progressBarBackground: { height: 8, backgroundColor: '#e5e7eb', borderRadius: 4, overflow: 'hidden' },
    progressBarFill: { height: '100%', backgroundColor: '#059669', borderRadius: 4 },
    progressPercentage: { fontFamily: 'Montserrat-SemiBold', fontSize: 12, color: '#4b5563', marginTop: 4, textAlign: 'right' },
    errorDisplay: { backgroundColor: '#fee2e2', padding: 12, borderRadius: 8, marginTop: 10, marginBottom: 20, borderWidth: 1, borderColor: '#fecaca' },
    errorText: { fontFamily: 'Montserrat-Regular', fontSize: 14, color: '#dc2626', textAlign: 'center' },
    infoCard: { flexDirection: 'row', backgroundColor: '#f0f9ff', padding: 16, borderRadius: 12, gap: 12, alignItems: 'flex-start', marginTop: 20, marginBottom: 20, borderWidth: 1, borderColor: '#e0f2fe' },
    infoTitle: { fontFamily: 'Montserrat-SemiBold', fontSize: 15, color: '#0369a1', marginBottom: 4 },
    infoText: { fontFamily: 'Montserrat-Regular', fontSize: 13, color: '#334155', lineHeight: 18, flexShrink: 1 }, // flexShrink ajouté
    footer: { padding: 16, backgroundColor: '#ffffff', borderTopWidth: 1, borderTopColor: '#e5e7eb', paddingBottom: Platform.OS === 'ios' ? 34 : 16 }, // Padding bas pour iPhone
    submitButton: { backgroundColor: '#059669', paddingVertical: 16, borderRadius: 10, alignItems: 'center', justifyContent: 'center', height: 52 }, // Hauteur fixe
    submitButtonDisabled: { backgroundColor: '#9ca3af', opacity: 0.7 },
    submitButtonText: { fontFamily: 'Montserrat-SemiBold', fontSize: 16, color: '#ffffff' },
});