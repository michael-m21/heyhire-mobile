import React, { useState, useEffect } from "react";
import {
    SafeAreaView,
    View,
    Text,
    Image,
    TouchableOpacity,
    ScrollView,
    Alert,
    ImageBackground,
    Linking,
} from "react-native";
import { getUser, setUser } from "../../../utils/utils";
import { postFormData } from "../../../utils/network.js";
import { LinearGradient } from "expo-linear-gradient";
import ConfirmationAlert from "../../../components/ConfirmationAlert";
import AlertPopup from "../../../components/AlertPopup";
import { strings } from "../../../translation/config";
import { useIsFocused } from "@react-navigation/native";
import moment from "moment";
import InstagramLoginPopup from "../../../components/InstagramLogin.js";
import { AntDesign, MaterialCommunityIcons } from "@expo/vector-icons";
import { connect } from 'react-redux';
import { sharedImages } from "../../../images";

function SeekerJobDetail({ route, navigation, nudgeJobPoster, nudgedJobs }) {
    const isFocused = useIsFocused();

    const tempJob = Object.assign({}, route.params.job, {});
    const [user, setUser1] = useState({});
    const [business, setBusiness] = useState(tempJob.business);
    const [job, setJob] = useState(tempJob);
    const [modal1, setModal1] = useState(false);
    const [modal2, setModal2] = useState(false);
    const [instaModalShow, setInstaModalShow] = useState(false);

    useEffect(() => {
        Linking.addEventListener("url", handleOpenURL);
        if (isFocused) {
            getUser().then((u) => {
                let u2 = JSON.parse(u);
                console.log("Local user", u2);
                setUser1(u2);
                let form = new FormData();
                form.append("user_token", u2.user_token);
                form.append("job_id", route.params.job.id);

                postFormData("/job_detail", form)
                    .then((res) => {
                        return res.json();
                    })
                    .then((json) => {
                        console.log("Detail", json);
                        setJob(
                            Object.assign(json.data, { applied_on: tempJob.applied_on, viewed_on: tempJob.viewed_on })
                        );
                    })
                    .catch((err) => {
                        console.log(err);
                    });
            });
        }

        return () => {
            Linking.removeEventListener("url", handleOpenURL);
        };
    }, [isFocused]);

    function handleOpenURL(event) {
        let businessId = event.url.split("/").filter(Boolean).pop();
        console.log("Hand", event.url, businessId);
        if (businessId == "instagram-success") {
            Alert.alert("Instagram connected successfully");
            onCloseInstagramConnect();
        } else if (businessId == "instagram-failure") {
            Alert.alert("Instagram not connected");
        }
    }

    function handlePostCV() {
        setModal1(true);
    }

    function onCloseInstagramConnect() {
        console.log(user);
        setInstaModalShow(false);

        getUser().then((u) => {
            let u2 = JSON.parse(u);
            console.log("Local user", u2);
            setUser1(u2);
            let form = new FormData();
            form.append("user_token", u2.user_token);
            form.append("user_id", u2.user_id);
            console.log("profile data", form);
            postFormData("user_profile", form)
                .then((res) => {
                    console.log("Prifile data", res);
                    return res.json();
                })
                .then((json) => {
                    console.log("Profile data", json);
                    var tempUserData = u2;
                    tempUserData.instagram_connected = json.data.instagram_connected;
                    console.log("tem", tempUserData);
                    setUser1(tempUserData);
                    setUser(tempUserData);
                })
                .catch((err) => {
                    console.log(err);
                });
        });
    }

    function onSendCV() {
        const currentDate = moment();
        const fiveDaysFromNow = moment().add(5, 'days')

        const data = {
            jobId: job.id,
            jobPosition: job.position,
            dayNudged: currentDate,
            nextNudge: fiveDaysFromNow
        };

        nudgeJobPoster(data);
        let form = new FormData();
        form.append("user_token", user.user_token);
        form.append("user_id", user.user_id);
        form.append("job_id", job.id);

        postFormData("send_cv", form)
            .then((res) => {
                return res.json();
            })
            .then((json) => {
                console.log("-----------");
                console.log(json.status_code);
                if (json.status_code != 200) {
                    Alert.alert("", json.msg);
                } else {
                    setModal2(true);
                    const tempJob = Object.assign({}, job, { aplied: "1", applied_on: new Date() });
                    setJob(tempJob);
                }

                console.log("+++++++++++");
            })
            .catch((err) => {
                console.log(err);
            });
    }

    useEffect(() => {
        setJob(job);
    }, [job]);

    function addWishlist() {
        let form = new FormData();
        form.append("user_token", user.user_token);
        form.append("user_id", user.user_id);
        form.append("job_id", job.id);

        let url = "add_like";
        if (job.like == "1") {
            url = "remove_like";
        }

        postFormData(url, form)
            .then((res) => {
                return res.json();
            })
            .then((json) => {
                console.log(job.like, url, json);
                if (json.status_code == 200) {
                    const tempJob = Object.assign({}, job, {});
                    if (tempJob.like == "1") {
                        tempJob.like = 0;
                    } else {
                        tempJob.like = "1";
                    }
                    setJob((job) => tempJob);
                }
            })
            .catch((err) => {
                console.log(err);
            });
    }

    function onCancelCV() {
        Alert.alert(
            "Confirm",
            "Are you sure you want to revoke your application?",
            [
                {
                    text: "Cancel",
                    onPress: () => { },
                    style: "cancel",
                },
                {
                    text: "OK",
                    onPress: () => {
                        let form = new FormData();
                        form.append("user_token", user.user_token);
                        form.append("user_id", user.user_id);
                        form.append("job_id", job.id);
                        form.append("cv_id", job.cv_id);

                        postFormData("cancel_cv", form)
                            .then((res) => {
                                return res.json();
                            })
                            .then((json) => {
                                console.log("-----------");
                                console.log(json.status_code);
                                if (json.status_code == 200) {
                                    Alert.alert("Successful", json.msg);

                                    navigation.goBack();
                                } else {
                                    Alert.alert("Error", json.msg);
                                }
                            })
                            .catch((err) => {
                                console.log(err);
                            });
                    },
                },
            ],
            { cancelable: false }
        );
    }

    function onNudge() {
        const appliedDate = moment(new Date(job.applied_on));
        const currentDate = moment();
        const fiveDaysFromNow = moment().add(5, 'days')

        const data = {
            jobId: job.id,
            jobPosition: job.position,
            dayNudged: currentDate,
            nextNudge: fiveDaysFromNow
        };

        const activeJobId = nudgedJobs.filter((selectedJob) => selectedJob.data?.jobId === job?.id);

        if (activeJobId?.length === 0) {
            nudgeJobPoster(data);
            let form = new FormData();
                form.append("user_token", user.user_token);
                form.append("user_id", user.user_id);
                form.append("job_id", job.id);

                postFormData("nudge_job", form)
                    .then((res) => {
                        return res.json();
                    })
                    .then((json) => {
                        console.log(json);
                        if (json.status_code == 200) {
                            Alert.alert("", json.msg);
                        }
                    })
                    .catch((err) => {
                        console.log(err);
                    });
        } else {
            const upcomingNudge = activeJobId[0]?.data?.nextNudge;

            const remainingDays = currentDate.diff(upcomingNudge, 'days');

            if (remainingDays >= 0) {
                let form = new FormData();
                form.append("user_token", user.user_token);
                form.append("user_id", user.user_id);
                form.append("job_id", job.id);

                postFormData("nudge_job", form)
                    .then((res) => {
                        return res.json();
                    })
                    .then((json) => {
                        console.log(json);
                        if (json.status_code == 200) {
                            Alert.alert("", json.msg);
                        }
                    })
                    .catch((err) => {
                        console.log(err);
                    });
            } else {

                Alert.alert(
                        "",
                        "You can only nudge the manager after 5 business days. Please try again in " + remainingDays.toString()?.slice(1,) + " day(s)."
                      );
            }
        }
    }

    function dateFormat(date) {
        if (date) {
            let d = date.split("-");
            return `${d[1]}/${d[2]}/${d[0]}`;
        } else {
            return "";
        }
    }

    return (
        <LinearGradient style={{ flex: 1 }} colors={["#4E35AE", "#775ED7"]}>
            <SafeAreaView>
                <View
                    style={{
                        // backgroundColor: '#4E35AE',
                        flexDirection: "row",
                        alignItems: "center",
                        borderBottomWidth: 1,
                        borderBottomColor: "#715FCB",
                        paddingBottom: 10,
                        paddingTop: 15,
                    }}
                >
                    <View style={{ width: "33.3%", alignContent: "center" }}>
                        <TouchableOpacity onPress={() => navigation.goBack()}>
                            <Image
                                source={sharedImages.back}
                                style={{
                                    width: 28,
                                    height: 25,
                                    marginTop: 10,
                                    marginLeft: 10,
                                }}
                            />
                        </TouchableOpacity>
                    </View>
                    <View style={{ width: "33.3%" }}>
                        <Image
                            source={sharedImages.title_header}
                            style={{ width: 120, height: 25 }}
                        />
                    </View>
                    <View style={{ width: "33.3%" }}>
                        <View
                            style={{ flex: 1, flexDirection: "row", alignItems: "center" }}
                        >
                            <View style={{ flex: 2 }}></View>
                            {job.aplied == "1" ? (
                                <TouchableOpacity
                                    style={{ flex: 1 }}
                                    onPress={() => onCancelCV()}
                                >
                                    <Image
                                        source={require("../../../../assets/ic_checked_white.png")}
                                        style={{ width: 20, height: 20 }}
                                    />
                                </TouchableOpacity>
                            ) : job.like == "1" ? (
                                <TouchableOpacity
                                    style={{ flex: 1, alignItems: "center" }}
                                    onPress={() => addWishlist()}
                                >
                                    <Image
                                        source={require("../../../../assets/ic_heart_filled_w.png")}
                                        style={{ width: 25, height: 25 }}
                                        resizeMode={"stretch"}
                                    />
                                </TouchableOpacity>
                            ) : null}
                            <TouchableOpacity style={{ flex: 1 }}>
                                <Image
                                    source={require("../../../../assets/ic_share_w.png")}
                                    style={{ width: 20, height: 20 }}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
                <ScrollView style={{ marginBottom: 50 }}>
                    <View style={{ flex: 1, alignItems: "center", padding: 20 }}>
                        <ImageBackground
                            source={require("../../../../assets/img_ring.png")}
                            style={{
                                width: 136,
                                height: 136,
                                paddingTop: 17,
                                paddingLeft: 17,
                            }}
                        >
                            <Image
                                source={{ uri: business.avatar_image }}
                                style={{ width: 100, height: 100, borderRadius: 50 }}
                            />
                        </ImageBackground>
                    </View>

                    <View style={{ flex: 1, alignItems: "center", marginHorizontal: 20 }}>
                        <Text style={{ color: "#fff", fontSize: 22, textAlign: "center" }}>
                            {business.business_name}
                        </Text>
                    </View>

                    <View style={{ flex: 1, alignItems: "center" }}>
                        <Text style={{ color: "#fff" }}>
                            {strings.CURRENTLY_VIEWING_POSTION}: {job.position}
                        </Text>
                    </View>

                    {job.applied_on && (
                        <View
                            style={{
                                flex: 1,
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <Text style={{ color: "#fff" }}>{strings.APPLIED_ON}: </Text>

                            <Text style={{ color: "#fff", fontSize: 14 }}>
                                {moment(job.applied_on).format("MM/DD/YYYY")}
                            </Text>
                        </View>
                    )}

                    {job.viewed_on && (
                        <View
                            style={{
                                flex: 1,
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <Text style={{ color: "#fff" }}>{strings.VIEWED_ON}: </Text>

                            <Text style={{ color: "#fff", fontSize: 14 }}>
                                {moment(job.viewed_on).format("MM/DD/YYYY")}
                            </Text>
                        </View>
                    )}

                    <View
                        style={{
                            flex: 1,
                            alignItems: "center",
                            paddingBottom: 20,
                            borderBottomWidth: 1,
                            borderBottomColor: "#715FCB",
                        }}
                    >
                        <View
                            style={{ flex: 1, flexDirection: "row", alignItems: "center" }}
                        >
                            <Image
                                source={require("../../../../assets/ic_location.png")}
                                style={{ width: 13, height: 13 }}
                            />
                            <Text style={{ color: "#fff", marginLeft: 5 }}>
                                {business.address}
                            </Text>
                        </View>
                    </View>


                    <View
                        style={{
                            flex: 1,
                            alignItems: "center",
                            padding: 20,
                            borderBottomWidth: 1,
                            borderBottomColor: "#715FCB",
                        }}
                    >
                        <Text style={{ color: "#fff" }}>{business.business_detail}</Text>
                    </View>


                    <View
                        style={{
                            flex: 1,
                            alignItems: "flex-start",
                            backgroundColor: "#f6f6f6",
                            paddingTop: 40,
                            paddingLeft: 15,
                            paddingRight: 15,
                            paddingBottom: 50,
                        }}
                    >
                        <View
                            style={{
                                width: "100%",
                                padding: 20,
                                backgroundColor: "#fff",
                                minHeight: 300,
                                borderRadius: 10,
                                borderColor: "#eee",
                                borderWidth: 1,
                            }}
                        >
                            <View
                                style={{ flex: 1, flexDirection: "row", alignItems: "center" }}
                            >
                                <Image
                                    source={require("../../../../assets/ic_calender.png")}
                                    style={{ width: 20, height: 20 }}
                                />
                                <Text
                                    style={{ fontSize: 20, marginLeft: 5, fontWeight: "600" }}
                                >
                                    {strings.START_DATE}
                                </Text>
                            </View>
                            <Text style={{ marginBottom: 30, marginTop: 10, fontSize: 15 }}>
                                {dateFormat(job.start_date)}
                            </Text>

                            <View
                                style={{ flex: 1, flexDirection: "row", alignItems: "center" }}
                            >
                                <Image
                                    source={require("../../../../assets/ic_category.png")}
                                    style={{ width: 15, height: 15 }}
                                />
                                <Text
                                    style={{ fontSize: 20, marginLeft: 10, fontWeight: "600" }}
                                >
                                    {strings.POSITION_DESCRIPTION}
                                </Text>
                            </View>
                            <Text style={{ marginBottom: 30, marginTop: 10, fontSize: 15 }}>
                                {job.position_desc}
                            </Text>

                            <View
                                style={{ flex: 1, flexDirection: "row", alignItems: "center" }}
                            >
                                <Image
                                    source={require("../../../../assets/ic_mind.png")}
                                    style={{ width: 20, height: 20 }}
                                />
                                <Text
                                    style={{ fontSize: 20, marginLeft: 10, fontWeight: "600" }}
                                >
                                    {strings.REQUIRED_EXPERIENCE}
                                </Text>
                            </View>
                            <Text style={{ marginBottom: 30, marginTop: 10, fontSize: 15 }}>
                                {job.experience}
                            </Text>
                            <View
                                style={{ flex: 1, flexDirection: "row", alignItems: "center" }}
                            >
                                <Image
                                    source={require("../../../../assets/ic_certificate.png")}
                                    style={{ width: 20, height: 20 }}
                                />
                                <Text
                                    style={{ fontSize: 20, marginLeft: 10, fontWeight: "600" }}
                                >
                                    {strings.REQUIRED_CERTIFICATIONS}
                                </Text>
                            </View>
                            <Text style={{ marginBottom: 30, marginTop: 10, fontSize: 15 }}>
                                {job.required_certifications
                                    ? job.required_certifications.map((item) => item + "\n")
                                    : ""}
                            </Text>
                            {job.requires_instagram && (
                                <View>
                                    <View
                                        style={{
                                            flex: 1,
                                            flexDirection: "row",
                                            alignItems: "center",
                                        }}
                                    >
                                        <Image
                                            source={require("../../../../assets/instagram-brands.png")}
                                            style={{ width: 20, height: 20, tintColor: "#4834A6" }}
                                        />
                                        <Text
                                            style={{
                                                fontSize: 20,
                                                marginLeft: 10,
                                                fontWeight: "600",
                                            }}
                                        >
                                            {"Instagram required"}
                                        </Text>
                                    </View>

                                    <Text
                                        style={{ marginBottom: 30, marginTop: 10, fontSize: 15 }}
                                    >
                                        {business.business_name}{" "}
                                        {
                                            "is requesting that you connect your Instagram account to your profile to apply for this position."
                                        }
                                    </Text>
                                    {!user.instagram_connected ? (
                                        <View>
                                            <Text
                                                style={{ marginBottom: 20, marginTop: 5, fontSize: 15 }}
                                            >
                                                {"Please connect your Instagram"}
                                            </Text>
                                            <ImageBackground
                                                source={require("../../../../assets/insta-connect-bg.png")}
                                                style={{
                                                    borderRadius: 40,
                                                }}
                                                resizeMode={"stretch"}
                                            >
                                                <TouchableOpacity
                                                    style={{
                                                        padding: 12,
                                                        flexDirection: "row",
                                                        paddingVertical: 15,
                                                        alignItems: "center",
                                                        // justifyContent: 'center'
                                                    }}
                                                    onPress={() => {
                                                        setInstaModalShow(true);
                                                    }}
                                                >
                                                    <AntDesign
                                                        name="instagram"
                                                        size={32}
                                                        color="white"
                                                        style={{ position: "absolute", left: 20 }}
                                                    />
                                                    <Text
                                                        style={{
                                                            color: "#fff",
                                                            fontSize: 18,
                                                            marginLeft: 50,
                                                            fontWeight: "bold",
                                                        }}
                                                    >
                                                        {strings.CONNECT_YOUR_INSTAGRAM}
                                                    </Text>
                                                    <MaterialCommunityIcons
                                                        name={"checkbox-blank-circle-outline"}
                                                        size={32}
                                                        color="white"
                                                        style={{ position: "absolute", right: 20 }}
                                                    />
                                                </TouchableOpacity>
                                            </ImageBackground>
                                        </View>
                                    ) : (
                                        <View
                                            style={{
                                                flexDirection: "row",
                                                alignItems: "center",
                                                marginTop: 5,
                                            }}
                                        >
                                            <Text style={{ fontSize: 15, marginRight: 5 }}>
                                                {"Your account is connected to Instagram"}
                                            </Text>
                                            <Image
                                                source={require("../../../../assets/checkbox_checked.png")}
                                                style={{ width: 20, height: 20 }}
                                            />
                                        </View>
                                    )}
                                </View>
                            )}
                        </View>
                        {job.aplied == "1" ? (
                            <View
                                style={{
                                    flex: 1,
                                    alignItems: "center",
                                    marginTop: 20,
                                    width: "100%",
                                }}
                            >
                                <TouchableOpacity
                                    style={{
                                        width: "100%",
                                        backgroundColor: "#ff0",
                                        paddingTop: 12,
                                        paddingBottom: 12,
                                        borderRadius: 50,
                                        marginBottom: 10,
                                        justifyContent: "center",
                                    }}
                                    onPress={() => onNudge()}
                                >
                                    <Image
                                        source={require("../../../../assets/Bell.png")}
                                        style={{
                                            height: 25,
                                            width: 25,
                                            position: "absolute",
                                            left: 20,
                                        }}
                                    />
                                    <Text
                                        style={{ textAlign: "center", fontSize: 18, color: "#000" }}
                                    >
                                        {strings.SEND_NUDGE}
                                    </Text>
                                </TouchableOpacity>
                                <Text style={{ fontSize: 14, color: "#666", marginBottom: 10, marginHorizontal: 5, opacity: 0.7 }}>{strings.NUDGE_DESCRIPTION}</Text>
                                <TouchableOpacity
                                    style={{
                                        width: "100%",
                                        backgroundColor: "#f00",
                                        paddingTop: 12,
                                        paddingBottom: 12,
                                        borderRadius: 50,
                                    }}
                                    onPress={() => onCancelCV()}
                                >
                                    <Text
                                        style={{ textAlign: "center", fontSize: 18, color: "#fff" }}
                                    >
                                        {strings.CANCEL_APPLICATION}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <View
                                style={{
                                    flex: 1,
                                    alignItems: "center",
                                    marginTop: 20,
                                    width: "100%",
                                }}
                            >
                                <TouchableOpacity
                                    style={{
                                        width: "100%",
                                        backgroundColor:
                                            job.requires_instagram && !user.instagram_connected
                                                ? "#a8a4a6"
                                                : "#4834A6",
                                        paddingTop: 12,
                                        paddingBottom: 12,
                                        borderRadius: 50,
                                    }}
                                    onPress={() => handlePostCV()}
                                    disabled={job.requires_instagram && !user.instagram_connected}
                                >
                                    <Text
                                        style={{ textAlign: "center", fontSize: 18, color: "#fff" }}
                                    >
                                        {strings.SEND_APPLICATION}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                    <ConfirmationAlert
                        visible={modal1}
                        job={job}
                        business={business}
                        onClose={() => setModal1(false)}
                        onSendCV={() => onSendCV()}
                    />
                    <AlertPopup
                        visible={modal2}
                        job={job}
                        business={business}
                        onClose={() => setModal2(false)}
                    />
                    <InstagramLoginPopup
                        userId={user.user_id}
                        visible={instaModalShow}
                        onClose={() => {
                            onCloseInstagramConnect();
                        }}
                    />
                </ScrollView>
            </SafeAreaView>
        </LinearGradient>
    );
}

const mapStateToProps = ({ NudgedStatus }) => ({
    nudgedJobs: NudgedStatus.nudgedJobs
})

const mapDispatchToProps = ({ NudgedStatus: { nudgeJobPoster } }) => ({
    nudgeJobPoster: (data) => nudgeJobPoster(data),
})

export default connect(mapStateToProps, mapDispatchToProps)(SeekerJobDetail);
