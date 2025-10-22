import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { useSubscription } from '../stores';
import { colors, spacing, typography } from '../theme';
import {
  SUBSCRIPTION_PRICING,
  FEATURE_COMPARISON,
} from '@bailout/shared/types';

interface UpgradeScreenProps {
  navigation: any;
}

const UpgradeScreen: React.FC<UpgradeScreenProps> = ({ navigation }) => {
  const { upgradeToPro, currentTier } = useSubscription();
  const [isLoading, setIsLoading] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const proPricing = SUBSCRIPTION_PRICING.pro;

  const faqs = [
    {
      question: 'Can I cancel anytime?',
      answer: 'Yes! You can cancel your subscription at any time from the Settings page. You\'ll continue to have access until the end of your billing period.',
    },
    {
      question: 'What if I don\'t use all my calls?',
      answer: 'With Pro, you get unlimited calls! There\'s no limit or rollover needed - use BailOut as much as you need.',
    },
    {
      question: 'How realistic are the calls?',
      answer: 'Our AI-powered calls are incredibly realistic, using natural voice synthesis and dynamic conversations that adapt in real-time.',
    },
    {
      question: 'When does billing start?',
      answer: 'You get a 7-day free trial! Billing starts after the trial ends, and you can cancel before then with no charge.',
    },
  ];

  const testimonials = [
    {
      text: 'Saved me from so many awkward dates!',
      author: 'Sarah, 26',
      rating: 5,
    },
    {
      text: 'Worth every penny for peace of mind.',
      author: 'Mike, 31',
      rating: 5,
    },
    {
      text: 'The voices are so realistic, my friends never suspect a thing.',
      author: 'Jessica, 29',
      rating: 5,
    },
  ];

  const handleStartTrial = async () => {
    setIsLoading(true);

    try {
      // TODO: Integrate with actual Stripe checkout
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock success
      Toast.show({
        type: 'success',
        text1: 'Welcome to Pro!',
        text2: 'Your 7-day free trial has started.',
        visibilityTime: 5000,
      });

      // Navigate back to settings or home
      navigation.goBack();
    } catch (error) {
      Alert.alert(
        'Payment Failed',
        'There was an issue processing your payment. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestorePurchase = async () => {
    setIsLoading(true);

    try {
      // TODO: Implement restore purchase logic
      await new Promise(resolve => setTimeout(resolve, 1500));

      Toast.show({
        type: 'info',
        text1: 'Restore Complete',
        text2: 'No previous purchases found.',
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Restore Failed',
        text2: 'Could not restore purchases. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return '⭐'.repeat(rating);
  };

  // If already pro, show different content
  if (currentTier === 'pro') {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl }}>
          <Text style={{ fontSize: 64, marginBottom: spacing.lg }}>🎉</Text>
          <Text
            style={{
              color: colors.text,
              fontSize: typography.fontSize.title1,
              fontWeight: typography.fontWeight.bold,
              textAlign: 'center',
              marginBottom: spacing.md,
            }}
          >
            You're Already Pro!
          </Text>
          <Text
            style={{
              color: colors.textSecondary,
              fontSize: typography.fontSize.body,
              textAlign: 'center',
              marginBottom: spacing.xl,
            }}
          >
            You have unlimited access to all BailOut features.
          </Text>
          <TouchableOpacity
            style={{
              backgroundColor: colors.primary,
              borderRadius: spacing.radius.md,
              paddingVertical: spacing.md,
              paddingHorizontal: spacing.xl,
            }}
            onPress={() => navigation.goBack()}
          >
            <Text
              style={{
                color: colors.text,
                fontSize: typography.fontSize.button,
                fontWeight: typography.fontWeight.semibold,
              }}
            >
              Back to Settings
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: spacing.xxl }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View
          style={{
            padding: spacing.container.padding,
            alignItems: 'center',
          }}
        >
          <TouchableOpacity
            style={{
              position: 'absolute',
              left: spacing.container.padding,
              top: spacing.container.padding,
              padding: spacing.xs,
            }}
            onPress={() => navigation.goBack()}
          >
            <Text style={{ color: colors.link, fontSize: 30 }}>×</Text>
          </TouchableOpacity>

          <Text
            style={{
              color: colors.text,
              fontSize: typography.fontSize.display,
              fontWeight: typography.fontWeight.bold,
              marginTop: spacing.xl,
              marginBottom: spacing.sm,
            }}
          >
            Upgrade to Pro
          </Text>
          <Text
            style={{
              color: colors.textSecondary,
              fontSize: typography.fontSize.body,
              textAlign: 'center',
              maxWidth: 280,
            }}
          >
            Unlimited bailouts, premium voices, priority support
          </Text>

          <Text style={{ fontSize: 64, marginVertical: spacing.lg }}>🚀</Text>
        </View>

        {/* Pricing Card */}
        <View
          style={{
            marginHorizontal: spacing.container.padding,
            backgroundColor: colors.primary,
            borderRadius: spacing.radius.lg,
            padding: spacing.lg,
            alignItems: 'center',
            marginBottom: spacing.xl,
          }}
        >
          <View
            style={{
              backgroundColor: colors.success,
              borderRadius: spacing.radius.sm,
              paddingHorizontal: spacing.sm,
              paddingVertical: spacing.xs,
              marginBottom: spacing.md,
            }}
          >
            <Text
              style={{
                color: colors.textInverse,
                fontSize: typography.fontSize.caption1,
                fontWeight: typography.fontWeight.semibold,
              }}
            >
              7-DAY FREE TRIAL
            </Text>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
            <Text
              style={{
                color: colors.text,
                fontSize: 48,
                fontWeight: typography.fontWeight.bold,
              }}
            >
              ${proPricing.monthly.price}
            </Text>
            <Text
              style={{
                color: colors.text,
                fontSize: typography.fontSize.title3,
                marginBottom: 8,
                marginLeft: spacing.xs,
              }}
            >
              /month
            </Text>
          </View>

          <Text
            style={{
              color: colors.text,
              fontSize: typography.fontSize.footnote,
              opacity: 0.8,
              marginTop: spacing.xs,
            }}
          >
            Cancel anytime • No hidden fees
          </Text>
        </View>

        {/* CTA Button */}
        <View style={{ paddingHorizontal: spacing.container.padding, marginBottom: spacing.xl }}>
          <TouchableOpacity
            style={{
              backgroundColor: colors.secondary,
              borderRadius: spacing.radius.md,
              paddingVertical: spacing.md,
              alignItems: 'center',
              shadowColor: colors.secondary,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 8,
            }}
            onPress={handleStartTrial}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.text} />
            ) : (
              <Text
                style={{
                  color: colors.text,
                  fontSize: typography.fontSize.button,
                  fontWeight: typography.fontWeight.bold,
                }}
              >
                Start Free Trial
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Feature Comparison */}
        <View
          style={{
            marginHorizontal: spacing.container.padding,
            marginBottom: spacing.xl,
          }}
        >
          <Text
            style={{
              color: colors.text,
              fontSize: typography.fontSize.title3,
              fontWeight: typography.fontWeight.semibold,
              marginBottom: spacing.md,
            }}
          >
            Compare Plans
          </Text>

          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: spacing.radius.md,
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <View
              style={{
                flexDirection: 'row',
                backgroundColor: colors.surfaceSecondary,
                paddingVertical: spacing.sm,
                paddingHorizontal: spacing.md,
              }}
            >
              <View style={{ flex: 1 }} />
              <Text
                style={{
                  flex: 1,
                  color: colors.textSecondary,
                  fontSize: typography.fontSize.caption1,
                  fontWeight: typography.fontWeight.semibold,
                  textAlign: 'center',
                }}
              >
                FREE
              </Text>
              <Text
                style={{
                  flex: 1,
                  color: colors.warning,
                  fontSize: typography.fontSize.caption1,
                  fontWeight: typography.fontWeight.semibold,
                  textAlign: 'center',
                }}
              >
                PRO
              </Text>
            </View>

            {/* Features */}
            {FEATURE_COMPARISON.map((feature, index) => (
              <View
                key={index}
                style={{
                  flexDirection: 'row',
                  paddingVertical: spacing.sm,
                  paddingHorizontal: spacing.md,
                  borderBottomWidth: index === FEATURE_COMPARISON.length - 1 ? 0 : 1,
                  borderBottomColor: colors.border,
                }}
              >
                <Text
                  style={{
                    flex: 1,
                    color: colors.text,
                    fontSize: typography.fontSize.caption1,
                  }}
                >
                  {feature.feature}
                </Text>
                <View style={{ flex: 1, alignItems: 'center' }}>
                  <Text
                    style={{
                      color: colors.textSecondary,
                      fontSize: typography.fontSize.caption1,
                    }}
                  >
                    {typeof feature.free === 'boolean'
                      ? feature.free ? '✓' : '✗'
                      : feature.free}
                  </Text>
                </View>
                <View style={{ flex: 1, alignItems: 'center' }}>
                  <Text
                    style={{
                      color: colors.success,
                      fontSize: typography.fontSize.caption1,
                      fontWeight: typography.fontWeight.semibold,
                    }}
                  >
                    {typeof feature.pro === 'boolean'
                      ? feature.pro ? '✓' : '✗'
                      : feature.pro}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Social Proof */}
        <View
          style={{
            marginHorizontal: spacing.container.padding,
            marginBottom: spacing.xl,
          }}
        >
          <Text
            style={{
              color: colors.text,
              fontSize: typography.fontSize.title3,
              fontWeight: typography.fontWeight.semibold,
              marginBottom: spacing.md,
            }}
          >
            Loved by Thousands
          </Text>

          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: spacing.radius.md,
              padding: spacing.md,
              marginBottom: spacing.md,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: spacing.md,
              }}
            >
              <Text
                style={{
                  color: colors.text,
                  fontSize: typography.fontSize.headline,
                  fontWeight: typography.fontWeight.semibold,
                }}
              >
                10,000+ Pro Members
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ fontSize: 16, marginRight: spacing.xs }}>
                  {renderStars(5)}
                </Text>
                <Text
                  style={{
                    color: colors.text,
                    fontSize: typography.fontSize.body,
                    fontWeight: typography.fontWeight.semibold,
                  }}
                >
                  4.8/5
                </Text>
              </View>
            </View>

            {testimonials.map((testimonial, index) => (
              <View
                key={index}
                style={{
                  paddingVertical: spacing.sm,
                  borderTopWidth: index === 0 ? 0 : 1,
                  borderTopColor: colors.border,
                }}
              >
                <Text
                  style={{
                    color: colors.text,
                    fontSize: typography.fontSize.body,
                    fontStyle: 'italic',
                    marginBottom: spacing.xs,
                  }}
                >
                  "{testimonial.text}"
                </Text>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text
                    style={{
                      color: colors.textSecondary,
                      fontSize: typography.fontSize.caption1,
                    }}
                  >
                    — {testimonial.author}
                  </Text>
                  <Text style={{ fontSize: 12 }}>
                    {renderStars(testimonial.rating)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* FAQ */}
        <View
          style={{
            marginHorizontal: spacing.container.padding,
            marginBottom: spacing.xl,
          }}
        >
          <Text
            style={{
              color: colors.text,
              fontSize: typography.fontSize.title3,
              fontWeight: typography.fontWeight.semibold,
              marginBottom: spacing.md,
            }}
          >
            Frequently Asked Questions
          </Text>

          {faqs.map((faq, index) => (
            <TouchableOpacity
              key={index}
              style={{
                backgroundColor: colors.surface,
                borderRadius: spacing.radius.md,
                marginBottom: spacing.sm,
                overflow: 'hidden',
              }}
              onPress={() => setExpandedFaq(expandedFaq === index ? null : index)}
              activeOpacity={0.7}
            >
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: spacing.md,
                }}
              >
                <Text
                  style={{
                    color: colors.text,
                    fontSize: typography.fontSize.body,
                    fontWeight: typography.fontWeight.medium,
                    flex: 1,
                  }}
                >
                  {faq.question}
                </Text>
                <Text
                  style={{
                    color: colors.textSecondary,
                    fontSize: 20,
                    marginLeft: spacing.sm,
                    transform: [{ rotate: expandedFaq === index ? '180deg' : '0deg' }],
                  }}
                >
                  ⌃
                </Text>
              </View>
              {expandedFaq === index && (
                <View
                  style={{
                    paddingHorizontal: spacing.md,
                    paddingBottom: spacing.md,
                    borderTopWidth: 1,
                    borderTopColor: colors.border,
                  }}
                >
                  <Text
                    style={{
                      color: colors.textSecondary,
                      fontSize: typography.fontSize.body,
                      marginTop: spacing.sm,
                    }}
                  >
                    {faq.answer}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Bottom Links */}
        <View
          style={{
            alignItems: 'center',
            paddingHorizontal: spacing.container.padding,
          }}
        >
          <TouchableOpacity
            onPress={handleRestorePurchase}
            disabled={isLoading}
            style={{ padding: spacing.sm }}
          >
            <Text
              style={{
                color: colors.link,
                fontSize: typography.fontSize.body,
              }}
            >
              Restore Purchase
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{ padding: spacing.sm, marginTop: spacing.sm }}
          >
            <Text
              style={{
                color: colors.textSecondary,
                fontSize: typography.fontSize.body,
              }}
            >
              Maybe Later
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Toast />
    </SafeAreaView>
  );
};

export default UpgradeScreen;