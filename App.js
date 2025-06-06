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
import EquipamentDetail from './Equipament/Equipament';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login">
          <Stack.Screen name="Login" component={LoginForm} options={{ headerShown: false }} />
          <Stack.Screen name="Áreas" component={AreasScreen} />
          <Stack.Screen name="AreaDetails" component={AreaDetails} options={({ route }) => ({ title: capitalizeFirstLetter(route.params.areaName) })} />
          <Stack.Screen name="AddSector" component={AddSector} options={{ title: 'Adicionar Setor' }} />
          <Stack.Screen name="AddEquipament" component={AddEquipament} options={{ title: 'AdicionarEquipamentos' }} />
          <Stack.Screen name="EquipamentDetail" component={EquipamentDetail} options={{title: 'Adicionar Manutenção'}} />
        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
}
