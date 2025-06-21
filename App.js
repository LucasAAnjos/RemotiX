import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { capitalizeFirstLetter } from './Utils/Formatters';

import LoginForm from './Login/LoginForm';
import AreasScreen from './Areas/AreasScreen';
import { AuthProvider } from './ValidaçõesTeste/AuthContext'; 
import AreaDetails from './AreaDetails/AreaDetails';
import AddSector from './Areas/AddSector';
import AddEquipament from './AreaDetails/AddEquipament';
import EquipamentDetail from './Equipament/EquipamentDetail';
import EquipamentFiles from './Equipament/EquipamentFiles';
import MotorControl from './Equipament/MotorControl';
import MaintenanceRegisterScreen from './Equipament/MaintenanceRegisterScreen';
import { firebaseApp } from './services/firebaseConfig';

const Stack = createNativeStackNavigator();

export default function App() {

  console.log(firebaseApp.options.projectId);
  

  return (
    <AuthProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login">
          <Stack.Screen name="Login" component={LoginForm} options={{ headerShown: false }} />
          <Stack.Screen name="Áreas" component={AreasScreen} />
          <Stack.Screen name="AreaDetails" component={AreaDetails} options={({ route }) => ({ title: capitalizeFirstLetter(route.params.areaName) })} />
          <Stack.Screen name="AddSector" component={AddSector} options={{ title: 'Adicionar Setor' }} />
          <Stack.Screen name="AddEquipament" component={AddEquipament} options={{ title: 'Adicionar Equipamentos' }} />
          <Stack.Screen name="EquipamentDetail" component={EquipamentDetail} options={{title: 'Equipamento'}} />
          <Stack.Screen name="MotorControl" component={MotorControl} options={{title: 'Controle'}} />
          <Stack.Screen name="EquipamentFiles" component={EquipamentFiles} options={{title: 'Arquivos'}} />
          <Stack.Screen name="MaintenanceRegisterScreen" component={MaintenanceRegisterScreen} options={{title: 'Registrar Manutenção'}} />
        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
}
