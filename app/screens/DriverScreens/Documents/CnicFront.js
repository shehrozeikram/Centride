import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import DocumentPicker from "react-native-document-picker";
import Color from "../../../utils/Color";
import AppButton from "../../../components/AppButton";
import AppInputField from "../../../components/AppInputField";
import { convertToBase64, pickImage, getSessionId } from "../../../utils/common";
import { Post } from "../../../network/network";
import { DRIVER_BASE_URL } from "../../../utils/constants";
import {
  NavigationContainer,
  useNavigation,
  useRoute,
} from "@react-navigation/native";

const CnicFront = () => {
  const [expiryDate, setExpiryDate] = useState("");
  const [cnicNumber, setCnicNumber] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [doc_id, setDocId] = useState();
  const [docStatus, setDocStatus] = useState('Required');
  const [cnicError, setCnicError] = useState('');
  const route = useRoute();
  const navigation = useNavigation();

  const formatCnicNumber = (value) => {
    // Remove all non-digit characters
    const numbers = value.replace(/\D/g, '');
    
    // Format the number with hyphens
    let formatted = '';
    if (numbers.length > 0) {
      formatted = numbers.slice(0, 5);
      if (numbers.length > 5) {
        formatted += '-' + numbers.slice(5, 12);
        if (numbers.length > 12) {
          formatted += '-' + numbers.slice(12, 13);
        }
      }
    }
    return formatted;
  };

  const handleCnicChange = (value) => {
    const formatted = formatCnicNumber(value);
    setCnicNumber(formatted);
    
    // Validate CNIC length
    const numbers = formatted.replace(/\D/g, '');
    if (numbers.length > 0 && numbers.length !== 13) {
      setCnicError('CNIC number must be exactly 13 digits');
    } else {
      setCnicError('');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case '0': return '#FFA500'; // Pending - Orange
      case '1': return '#FF4444'; // Failed - Red
      case '2': return '#8B00FF'; // Expired - Purple
      case '3': return '#4CAF50'; // Approved - Green
      default: return '#E91E63'; // Required - Pink
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case '0': return 'Pending';
      case '1': return 'Failed';
      case '2': return 'Expired';
      case '3': return 'Approved';
      default: return 'Required';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case '0': return 'time-outline';
      case '1': return 'close-circle-outline';
      case '2': return 'alert-circle-outline';
      case '3': return 'checkmark-circle-outline';
      default: return 'alert-circle-outline';
    }
  };

  const handleDocs = async () => {
    try {
      const sess_id = await getSessionId();
      const url = `${DRIVER_BASE_URL}?sess_id=${sess_id}`;
  
      const body = new URLSearchParams({
        action: "getUserDocs",
      }).toString();
  
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: body,
      });
  
      const responseData = await response.json();
      console.log('responseData', responseData);
  
      if (responseData.success === 1 && responseData.user_docs) {
        const doc = responseData.user_docs[doc_id];
        if (doc) {
          setDocStatus(doc.u_doc_status || '0');
          if (['0', '2', '3'].includes(doc.u_doc_status) && doc.u_doc_img) {
            setSelectedImage({ path: doc.u_doc_img });
          }
          if (doc.u_doc_expiry_date) {
            setExpiryDate(doc.u_doc_expiry_date);
          }
          if (doc.u_doc_id_num) {
            setCnicNumber(doc.u_doc_id_num);
          }
        }
      }
    } catch (error) {
      console.error("Error in handleDocs:", error);
    }
  };

  useEffect(() => {
    handleRoute()
  }, [route?.params])

  useEffect(() => {
    if (doc_id) {
      handleDocs();
    }
  }, [doc_id])

  const handleRoute = () => {
    if (route.params) {
        console.log('===========ROUTE==========', route.params?.doc_Id)
        setDocId(route?.params?.doc_Id)
    }
  }

  const handleImagePick = async () => {
    const imagePath = await pickImage()
    setSelectedImage(imagePath)
  }

  const handleImageUpdate = async (imagePath) => {
    // Validate CNIC before submission
    const numbers = cnicNumber.replace(/\D/g, '');
    if (numbers.length !== 13) {
      setCnicError('CNIC number must be exactly 13 digits');
      return;
    }

    const base64Image = await convertToBase64(imagePath)
    const documentData = {
        action: 'saveUserDoc',
        doc_id: doc_id,
        u_doc_expiry_date:expiryDate,
        doc_expiry:expiryDate,
        u_doc_id_num: cnicNumber,
        doc_id_input: cnicNumber,
        u_doc_img: base64Image,
    }

    // Update user photo
    Post({
        data: documentData,
    })
        .then((response) => {
            navigation.goBack()
            console.log('==response==', response)
        })
        .catch((error) => {
            console.log('======IMAGE-UPDATE ERROR====', error)
        })
  }

  const handleSubmit = () => {
    // Validate CNIC before submission
    const numbers = cnicNumber.replace(/\D/g, '');
    if (numbers.length !== 13) {
      setCnicError('CNIC number must be exactly 13 digits');
      return;
    }
    handleImageUpdate(selectedImage?.path)
  }

  return (
    <View style={styles.container}>
      {/* Status Tag */}
      <View style={[styles.requiredContainer, { backgroundColor: getStatusColor(docStatus) }]}>
        <Ionicons name={getStatusIcon(docStatus)} size={16} color="white" />
        <Text style={[styles.requiredTag, { color: 'white' }]}>{getStatusText(docStatus)}</Text>
      </View>

      {/* Title and Description */}
      <View style={styles.infoContainer}>
        <Text style={styles.title}>CNIC Front</Text>
        <Text style={styles.description}>
          Please upload a valid copy of your CNIC (Front).
        </Text>
      </View>

      {/* Sample Image Section */}
      <TouchableOpacity onPress={handleImagePick} style={styles.imageContainer}>
        {selectedImage ? (
          <Image source={{ uri: selectedImage?.path }} style={styles.image} />
        ) : (
          <Image
            source={require("../../../assets/personal-doc-sample.png")} // Replace with your sample image path
            style={styles.sampleImage}
          />
        )}
      </TouchableOpacity>

      {/* Expiry Date Input */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Enter the expiry date of the document</Text>
        <TextInput
          style={styles.input}
          placeholder="YYYY-MM-DD"
          value={expiryDate}
          onChangeText={setExpiryDate}
        />
      </View>

      {/* CNIC Number Input */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Enter the CNIC number of the driver</Text>
        <Text style={styles.subLabel}>Format: XXXXX-XXXXXXX-X</Text>
        <TextInput
          style={[styles.input, cnicError ? styles.inputError : null]}
          placeholder="12345-1234567-1"
          value={cnicNumber}
          onChangeText={handleCnicChange}
          keyboardType="numeric"
          maxLength={15}
        />
        {cnicError ? <Text style={styles.errorText}>{cnicError}</Text> : null}
      </View>

      {/* Submit Button */}
      <AppButton onPress={handleSubmit} name="Submit" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f9f9f9",
    // marginTop: 50,
  },
  requiredContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  requiredTag: {
    marginLeft: 5,
    fontWeight: 'bold',
  },
  infoContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  description: {
    fontSize: 16,
    color: "#555",
  },
  imageContainer: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 20,
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 20,
  },
  sampleImage: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    resizeMode: "contain",
  },
  image: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    marginBottom: 10,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: "#333",
    marginBottom: 5,
  },
  subLabel: {
    fontSize: 14,
    color: "#777",
    marginBottom: 5,
  },
  input: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 10,
  },
  inputError: {
    borderColor: '#FF4444',
  },
  errorText: {
    color: '#FF4444',
    fontSize: 12,
    marginTop: 5,
  },
});

export default CnicFront;
