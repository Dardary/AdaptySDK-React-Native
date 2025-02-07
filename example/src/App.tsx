import React, { useEffect, useMemo, useState } from 'react';
import {
  Button,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import Config from 'react-native-config';
import { activateAdapty, adapty, AdaptyPaywall } from '../../lib/src';
import styles from './App.styles';

// ADAPTY API KEY
const ADAPTY_PUBLIC_KEY = Config.ADAPTY_PUBLIC_KEY;

interface SampleUser {
  userId: string;
}

interface SampleResponse {
  functionCalled: string;
  response: any;
  isError?: boolean;
}

export const App: React.FC = () => {
  const [user, setUser] = useState<SampleUser | undefined>();
  const [response, _setResponse] = useState<SampleResponse | undefined>();
  const [subscriptions, setSubscriptions] = useState<any[]>([]);

  const setResponse = (data: typeof response) => {
    console.log(data.functionCalled, data.response);
    _setResponse(data);
  };

  const [idInputValue, setIdInputValue] = useState<string>('');
  const [paywalls, setPaywalls] = useState<AdaptyPaywall[]>([]);

  useEffect(() => {
    /*
     * Preferable way to activate adapty is via
     * effect hook: that way it mounts early on
     */

    console.log('Public SDK Key: ', ADAPTY_PUBLIC_KEY);

    activateAdapty({
      sdkKey: ADAPTY_PUBLIC_KEY, // Your sdk key goes here
      /*
       * Note, that we pass dynamic userId value, yet we don't
       * set userId as a useEffect hook dependency.
       *
       * activateAdapty is made only to initialize sdk,
       * Inside real application any store would provide userId on initialization
       * if it is present.
       *
       * To set customerUserId after initialization you should use `adapty.user.identify(userId)`
       */
      customerUserId: user?.userId,
      logLevel: 'verbose',
    });
  }, []);

  const renderResponse = (): React.ReactElement => {
    if (!response) {
      return (
        <ScrollView style={styles.responseContainer}>
          <Text style={{ ...styles.titleSubText, marginHorizontal: 0 }}>
            Your response will be here
          </Text>
        </ScrollView>
      );
    }
    return (
      <ScrollView style={styles.responseContainer}>
        <Text style={{ ...styles.titleSubText, marginHorizontal: 0 }}>
          Result of: {response.functionCalled}
        </Text>
        <Text
          style={[
            styles.responseCode,
            response.isError && styles.responseError,
          ]}
        >
          {JSON.stringify(response.response, null, 2)}
        </Text>
      </ScrollView>
    );
  };
  const MemoizedResponse = useMemo(renderResponse, [response]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.wrapper}>
        <View style={styles.titleContainer}>
          <Text style={styles.titleText}>Adapty React Native</Text>

          <Button title="Logout" disabled={!user?.userId} onPress={() => {}} />
        </View>

        <View style={styles.sessionContainer}>
          <Text>Current userID: </Text>
          <Text style={styles.sessionUserText}>{user?.userId || 'None'}</Text>
          <Text>Listeners: {subscriptions.length}</Text>
        </View>

        {MemoizedResponse}

        <Text style={styles.titleSubText}>Add a listener</Text>
        <View style={styles.exampleElementContainer}>
          <Button
            title="onInfoUpdate"
            onPress={async () => {
              const sub = adapty.addEventListener('onInfoUpdate', data =>
                setResponse({
                  functionCalled: '[event] onInfoUpdate',
                  response: data,
                }),
              );
              setSubscriptions([...subscriptions, sub]);
            }}
          />
          <Button
            title="onPromoReceived"
            onPress={async () => {
              const sub = adapty.addEventListener('onPromoReceived', data =>
                setResponse({
                  functionCalled: '[event] onPromoReceived',
                  response: data,
                }),
              );
              setSubscriptions([...subscriptions, sub]);
            }}
          />
        </View>

        <Text style={styles.titleSubText}>Identify user</Text>
        <View style={styles.exampleElementContainer}>
          <Text style={styles.text}>
            If you have obtained userID after your application had mounted, it
            is better to call
            <Text style={styles.codeText}> adapty.user.identify() </Text> to set
            customerUserId for this user.
          </Text>

          <View style={styles.inputContainer}>
            <Text style={styles.inputTitleText}>Identify: </Text>
            <TextInput
              style={styles.inputWrapper}
              value={idInputValue}
              placeholder="customerUserId"
              onChangeText={setIdInputValue}
            />

            <Button
              title="Confirm"
              disabled={idInputValue === ''}
              onPress={async () => {
                try {
                  const result = await adapty.profile.identify(idInputValue);
                  setUser({ userId: idInputValue });
                  setResponse({
                    functionCalled: 'Identify user',
                    response: result,
                  });
                  setIdInputValue('');
                } catch (error) {
                  setResponse({
                    functionCalled: 'Identify user',
                    response: error,
                    isError: true,
                  });
                }
              }}
            />
          </View>
        </View>

        <Text style={styles.titleSubText}>Update profile</Text>
        <View style={styles.exampleElementContainer}>
          <Text style={styles.text}>
            You can update info about user using
            <Text style={styles.codeText}> adapty.user.updateProfile()</Text>.
            Pressing this button would set multiple keys to a value
            "react-native"
          </Text>
          <Button
            title="adapty.user.updateProfile()"
            onPress={async () => {
              try {
                const result = await adapty.profile.update({
                  firstName: 'react',
                  lastName: 'native',
                  amplitudeUserId: '1111111',
                  appmetricaDeviceId: '222222222',
                  email: 'react@native.divan',
                  facebookUserId: '3333333',
                  customAttributes: {
                    poweredBy: 'react-native',
                    foo: 'bar',
                  },
                });

                setResponse({
                  functionCalled: 'Update Profile',
                  response: result,
                });
              } catch (error) {
                setResponse({
                  functionCalled: 'Identify user',
                  response: error,
                  isError: true,
                });
              }
            }}
          />
        </View>

        <Text style={styles.titleSubText}>Get purchaser info</Text>
        <View style={styles.exampleElementContainer}>
          <Text style={styles.text}>
            To check wether this user obtains any purchases, you may call
            <Text style={styles.codeText}> adapty.purchases.getInfo()</Text>.
          </Text>

          <Button
            title="adapty.purchases.getInfo()"
            onPress={async () => {
              try {
                const result = await adapty.purchases.getInfo();
                setResponse({
                  functionCalled: 'Get purchaser info',
                  response: result,
                });
                setIdInputValue('');
              } catch (error) {
                setResponse({
                  functionCalled: 'Get purchaser info',
                  response: error,
                  isError: true,
                });
              }
            }}
          />
        </View>

        <Text style={styles.titleSubText}>Purchase</Text>
        <Text style={styles.text}>To purchase something, fetch paywalls</Text>

        <Text style={styles.titleSubText}>Collect paywalls</Text>
        <View style={styles.exampleElementContainer}>
          <Text style={styles.text}>
            You may fetch all available paywalls in order to call one within
            your application.
          </Text>

          <Button
            title="adapty.paywalls.getPaywalls()"
            onPress={async () => {
              try {
                const result = await adapty.paywalls.getPaywalls();
                setPaywalls(result.paywalls);
                setResponse({
                  functionCalled: 'Collect paywalls',
                  response: result,
                });
              } catch (error) {
                setResponse({
                  functionCalled: 'Collect paywalls',
                  response: error,
                  isError: true,
                });
              }
            }}
          />
        </View>
        {paywalls.map(paywall => (
          <View
            style={styles.exampleElementContainer}
            key={paywall.developerId}
          >
            <Text style={styles.titleSubText}>
              Paywall: {paywall.name}|{paywall.developerId}
            </Text>

            {paywall.products.map(product => (
              <View key={product.vendorProductId}>
                <Text>{product.localizedTitle}</Text>
                <Text>{product.localizedDescription}</Text>

                <Button
                  title={product.localizedPrice}
                  onPress={async () => {
                    try {
                      const result = await adapty.purchases.makePurchase(
                        product,
                      );

                      setResponse({
                        functionCalled: 'Purchase',
                        response: result,
                      });
                    } catch (error) {
                      setResponse({
                        functionCalled: 'Purchase',
                        response: error,
                        isError: true,
                      });
                    }
                  }}
                />
              </View>
            ))}
          </View>
        ))}

        <Text style={styles.titleSubText}>Restore purchases</Text>
        <View style={styles.exampleElementContainer}>
          <Text style={styles.text}>
            You may restore purchases via restore function. If it succeeds you
            should use
            <Text style={styles.codeText}> adapty.purchases.getInfo()</Text> to
            fetch restored goods.
          </Text>

          <Button
            title="adapty.purchases.restore()"
            onPress={async () => {
              try {
                const result = await adapty.purchases.restore();
                setResponse({
                  functionCalled: 'Restore',
                  response: result,
                });
              } catch (error) {
                setResponse({
                  functionCalled: 'Restore',
                  response: error,
                  isError: true,
                });
              }
            }}
          />
        </View>

        <Text style={styles.titleSubText}>Collect promos</Text>
        <View style={styles.exampleElementContainer}>
          <Text style={styles.text}>
            You may fetch all available promo campaigns to offer user a lowered
            price
          </Text>

          <Button
            title="adapty.promo.getPromo()"
            onPress={async () => {
              try {
                const result = await adapty.promo.getPromo();
                setResponse({
                  functionCalled: 'Collect promos',
                  response: result,
                });
              } catch (error) {
                setResponse({
                  functionCalled: 'Collect promos',
                  response: error,
                  isError: true,
                });
              }
            }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
