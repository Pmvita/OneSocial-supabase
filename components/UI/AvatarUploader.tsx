import React, { useState } from 'react';
import { View, Button, Image, StyleSheet, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import  supabase  from '../../lib/supabase';
import Loader from '../Common/Loader';

const storage = supabase.storage.from('avatars');
const auth = supabase.auth;

const AvatarUploader = () => {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);


  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const uploadImage = async () => {
    if (!image) {
      Alert.alert("No Image Selected", "Please select an image to upload.");
      return;
    }

    setLoading(true);

    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error("User not authenticated.");
      }

      const response = await fetch(image);
      const blob = await response.blob();
      const avatarRef = ref(storage, `avatars/${user.uid}.jpg`);
      await uploadBytes(avatarRef, blob);

      const downloadURL = await getDownloadURL(avatarRef);
      console.log("Image uploaded and accessible at:", downloadURL);
      Alert.alert("Success", "Profile picture updated!");

    } catch (error: any) {
      console.error(error);
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {loading && <Loader />}
      {image && <Image source={{ uri: image }} style={styles.avatar} />}
      <Button title="Choose Image" onPress={pickImage} />
      <Button title="Upload Image" onPress={uploadImage} />
    </View>
  );
};

export default AvatarUploader;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
});