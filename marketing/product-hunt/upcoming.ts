const query = (operationName: string, variables: object) => 
    fetch("https://www.producthunt.com/frontend/graphql", {
        body: JSON.stringify({
            operationName,
            variables,
            "query": "query ShipLandingShowPage($slug:String!$variant:String$includeControls:Boolean!){upcomingPage(slug:$slug){...ShipLandingShowContent ...MetaTags __typename}}fragment ShipLandingShowContent on UpcomingPage{_id id ...UpcomingPageLayout ...ShipLandingShowTemplate __typename}fragment ShipLandingShowTemplate on UpcomingPage{_id id name slug updatedAt isSubscribed user{id _id ...ShipLandingShowTemplateUser ...UserImage __typename}variant(preferred_kind:$variant){id _id ...ShipLandingShowTemplateVariant __typename}...UpcomingPageLayout ...ShipLandingShowSubscribeCTA ...ShipLandingDownloadCTA ...FacebookShareButtonFragment __typename}fragment ShipLandingShowTemplateVariant on UpcomingPageVariant{id _id kind backgroundColor templateName whoText whatText whyText media{...Media __typename}__typename}fragment ShipLandingShowTemplateUser on User{id _id twitterUsername ...UserImage __typename}fragment ShipLandingShowSubscribeCTA on UpcomingPage{_id id slug name ...ShipLandingShowSubscribeForm ...ShipLandingShowSubscribes ...FacebookShareButtonFragment __typename}fragment ShipLandingShowSubscribeForm on UpcomingPage{_id id user{id _id firstName username twitterUsername __typename}variant(preferred_kind:$variant){_id id brandColor whyText __typename}survey(used_in_upcoming_page:true){id __typename}__typename}fragment ShipLandingShowSubscribes on UpcomingPage{_id id popularSubscribers{id name ...UserImage __typename}subscriberCount variant(preferred_kind:$variant){_id id brandColor whyText __typename}__typename}fragment UserImage on User{_id id name username avatarUrl headline isViewer ...KarmaBadge __typename}fragment KarmaBadge on User{karmaBadge{kind score __typename}__typename}fragment FacebookShareButtonFragment on Shareable{id url __typename}fragment ShipLandingDownloadCTA on UpcomingPage{_id id appStoreUrl playStoreUrl __typename}fragment Media on Media{imageUuid mediaType originalWidth originalHeight metadata{url platform videoId __typename}__typename}fragment UpcomingPageLayout on UpcomingPage{_id id name slug status canManage variant(preferred_kind:$variant){id _id brandColor backgroundColor backgroundImageUuid unsplashBackgroundUrl templateName __typename}...UpcomingPageLayoutHeader ...UpcomingPageLayoutFooter ...UpcomingPageLayoutControls@include(if:$includeControls)__typename}fragment UpcomingPageLayoutHeader on UpcomingPage{_id id name slug variant(preferred_kind:$variant){id _id logoUuid __typename}__typename}fragment UpcomingPageLayoutFooter on UpcomingPage{_id id facebookUrl angellistUrl twitterUrl jobsUrl websiteUrl privacyPolicyUrl canManage __typename}fragment UpcomingPageLayoutControls on UpcomingPage{id _id slug status canPromoteUpcomingPage canManageShipAb canManage canRequestStripeDiscount canClaimAwsCredits canManageEmailForm canManageWebhooks subscriberCount account{_id id __typename}ship{...ShipManageSubscriptionStatus __typename}...UpcomingPageLayoutControlsForm ...FacebookShareButtonFragment __typename}fragment UpcomingPageLayoutControlsForm on UpcomingPage{id _id accountId angellistUrl appStoreUrl availableTemplateNames canManageShipAb canPromoteUpcomingPage facebookUrl hiring name playStoreUrl privacyPolicyUrl seoDescription seoImageUuid seoTitle slug status subscriberCount successText tagline thumbnailUuid topicIds twitterUrl updatedAt webhookUrl websiteUrl widgetIntroMessage variants{id _id backgroundColor backgroundImageUuid brandColor kind logoUuid templateName thumbnailUuid unsplashBackgroundUrl whatText whoText whyText media{...Media __typename}__typename}...MetaTags __typename}fragment MetaTags on SEOInterface{id meta{canonicalUrl creator description image mobileAppUrl oembedUrl robots title type author authorUrl __typename}__typename}fragment ShipManageSubscriptionStatus on Ship{cancelledBillingPlan endsAt ended billingPlan billingPeriod inTrial trialEnded __typename}"
        }),
        headers: {
            Accept: "*/*",
            "Content-Type": "application/json",
        },
        method: "POST"
    }).then(res => res.json())


export const createShipPage = (page: ShipPage) => 
    query('CreateUpcomingPage', {
        "input": page,
})

export const getShipPage = (shipPageSlug: string) => 
    query('ShipLandingShowPage', {
        "slug": shipPageSlug,
        "variant": "a",
        "includeControls": true
})

export const updateShipPage = (shipPageSlug: string, page: ShipPage) => 
    query('SaveUpcomingPage', {
        "input": page,
        "reloadVariant": false
})

export interface ShipPage {
    _id:                     string;
    id?:                     string;
    __typename?:             string;
    accountId?:              string;
    angellistUrl?:           string;
    appStoreUrl?:            string;
    availableTemplateNames?: string[];
    canManageShipAb?:        boolean;
    canPromoteUpcomingPage?: boolean;
    facebookUrl?:            string;
    hiring?:                 boolean;
    name?:                   string;
    playStoreUrl?:           string;
    privacyPolicyUrl?:       string;
    seoDescription?:         string;
    seoImageUuid?:           string;
    seoTitle?:               string;
    slug?:                   string;
    status?:                 string;
    tagline?:                string;
    thumbnailUuid?:          string;
    topicIds?:               string[];
    twitterUrl?:             string;
    updatedAt?:              Date;
    webhookUrl?:             string;
    websiteUrl?:             string;
    widgetIntroMessage?:     string;
    variants?:               Variant[];
    meta?:                   Meta;
}

export interface Meta {
    canonicalUrl?: string;
    creator?:      string;
    description?:  string;
    image?:        string;
    mobileAppUrl?: string;
    oembedUrl?:    string;
    robots?:       string;
    title?:        string;
    type?:         string;
    author?:       string;
    authorUrl?:    string;
    __typename?:   string;
}

export interface Variant {
    id?:                    string;
    _id?:                   string;
    backgroundColor?:       string;
    backgroundImageUuid?:   string;
    brandColor?:            string;
    kind?:                  string;
    logoUuid?:              string;
    templateName?:          string;
    thumbnailUuid?:         string;
    unsplashBackgroundUrl?: string;
    whatText?:              string;
    whoText?:               string;
    whyText?:               string;
    media?:                 Media;
    __typename?:            string;
}

export interface Media {
    __typename?:     string;
    imageUuid?:      string;
    mediaType?:      string;
    originalWidth?:  number;
    originalHeight?: number;
    metadata?:       Metadata;
}

export interface Metadata {
    url?:        string;
    platform?:   string;
    videoId?:    string;
    __typename?: string;
}
