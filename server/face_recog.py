import cv2
import face_recognition
import atexit

# This is a super simple (but slow) example of running face recognition on live video from your webcam.
# There's a second example that's a little more complicated but runs faster.

# PLEASE NOTE: This example requires OpenCV (the `cv2` library) to be installed only to read from your webcam.
# OpenCV is *not* required to use the face_recognition library. It's only required if you want to run this
# specific demo. If you have trouble installing it, try any of the other demos that don't require it instead.

# Get a reference to webcam #0 (the default one)
video_capture = cv2.VideoCapture(0)

people = [
    "Yustynn",
    "Jarvin",
    "Mario",
    "SPH"
]

images = [face_recognition.load_image_file(f"pics/{p.lower()}.jpg") for p in people]
known_face_encodings = [face_recognition.face_encodings(img)[0] for img in images]

def detect_face(num_frames=3):
    names = []

    for frame in range(num_frames):
        # Grab a single frame of video
        ret, frame = video_capture.read()


        # Convert the image from BGR color (which OpenCV uses) to RGB color (which face_recognition uses)
        rgb_frame = frame[:, :, ::-1]

        # Find all the faces and face enqcodings in the frame of video
        face_locations = face_recognition.face_locations(rgb_frame)
        face_encodings = face_recognition.face_encodings(rgb_frame, face_locations)

        # Loop through each face in this frame of video
        for (top, right, bottom, left), face_encoding in zip(face_locations, face_encodings):
            # See if the face is a match for the known face(s)
            matches = face_recognition.compare_faces(known_face_encodings, face_encoding)

            name = "Unknown"
            print(matches)

            # If a match was found in known_face_encodings, just use the first one.
            if True in matches:
                first_match_index = matches.index(True)
                name = people[first_match_index]

            if matches.count(True) > 1:
                name = 'Multiple'

            print(f"Detected {name}")
            names.append(name)

    return max(set(names), key=names.count).lower()


def quit_video():
    video_capture.release()
    cv2.destroyAllWindows()

atexit.register(quit_video)