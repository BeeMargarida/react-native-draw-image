#ifdef RCT_NEW_ARCH_ENABLED
#import "DrawImageView.h"

#import <react/renderer/components/RNDrawImageViewSpec/ComponentDescriptors.h>
#import <react/renderer/components/RNDrawImageViewSpec/EventEmitters.h>
#import <react/renderer/components/RNDrawImageViewSpec/Props.h>
#import <react/renderer/components/RNDrawImageViewSpec/RCTComponentViewHelpers.h>

#import "RCTFabricComponentsPlugins.h"
#import "Utils.h"

using namespace facebook::react;

@interface DrawImageView () <RCTDrawImageViewViewProtocol>

@end

@implementation DrawImageView {
    UIView * _view;
}

+ (ComponentDescriptorProvider)componentDescriptorProvider
{
    return concreteComponentDescriptorProvider<DrawImageViewComponentDescriptor>();
}

- (instancetype)initWithFrame:(CGRect)frame
{
  if (self = [super initWithFrame:frame]) {
    static const auto defaultProps = std::make_shared<const DrawImageViewProps>();
    _props = defaultProps;

    _view = [[UIView alloc] init];

    self.contentView = _view;
  }

  return self;
}

- (void)updateProps:(Props::Shared const &)props oldProps:(Props::Shared const &)oldProps
{
    const auto &oldViewProps = *std::static_pointer_cast<DrawImageViewProps const>(_props);
    const auto &newViewProps = *std::static_pointer_cast<DrawImageViewProps const>(props);

    if (oldViewProps.color != newViewProps.color) {
        NSString * colorToConvert = [[NSString alloc] initWithUTF8String: newViewProps.color.c_str()];
        [_view setBackgroundColor: [Utils hexStringToColor:colorToConvert]];
    }

    [super updateProps:props oldProps:oldProps];
}

Class<RCTComponentViewProtocol> DrawImageViewCls(void)
{
    return DrawImageView.class;
}

@end
#endif
