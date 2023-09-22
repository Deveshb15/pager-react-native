import { useCallback, useEffect, useMemo, useState } from "react";

import * as Contacts from "expo-contacts";

import useUser from "@hooks/useUser";
import Countries from "@utils/countries";
import { cleanupPhone, resize } from "@utils/helpers";
import useCheckInvites from "@queries/useCheckInvites";

export default function useContacts(props = {}) {
  // Make sure these prop functions are wrapped in a useCallback
  // function, inside the hook consumer, to prevent unnecessary
  // re-rendering

  const { onDenied } = props;
  const { userData } = useUser();
  const [contacts, setContacts] = useState(null);
  const [inMemory, setInMemory] = useState(null);
  const [permission, setPermission] = useState(null);
  const invites = useCheckInvites(userData?.phone?.full);

  const getContacts = useCallback(async () => {
    Contacts.getContactsAsync({
      fields: [
        Contacts.Fields.Name,
        Contacts.Fields.Image,
        Contacts.Fields.PhoneNumbers,
      ],
      sort: Contacts.SortTypes.UserDefault,
    }).then(async (contacts) => {
      const processed = await processContacts(contacts);
      setContacts(processed);
      setInMemory(processed);
    });
  }, [processContacts]);

  const processContacts = useCallback(async (contacts) => {
    const withPhotos = [];
    const withoutPhotos = [];

    await Promise.all(
      contacts?.data?.map(async (contact) => {
        if (
          contact?.name &&
          contact?.name !== "" &&
          contact?.phoneNumbers?.length > 0
        ) {
          const country_code = Countries[contact?.phoneNumbers[0]?.countryCode];
          const number = cleanupPhone(contact?.phoneNumbers[0]?.digits);

          if (contact?.image) {
            withPhotos.push({
              dp: await resize(contact?.image, 100, 100),
              id: contact?.id,
              name: contact?.name,
              phone: {
                country_code,
                full: `${country_code}${number}`,
                number,
              },
            });
          } else {
            withoutPhotos.push({
              id: contact?.id,
              name: contact?.name,
              phone: {
                country_code,
                full: `${country_code}${number}`,
                number,
              },
            });
          }
        }
      }),
    );

    return [...withPhotos, ...withoutPhotos];
  }, []);

  const requestContacts = useCallback(async () => {
    let finalPermission = permission;

    if (permission.status !== "granted") {
      const request = await Contacts.requestPermissionsAsync();
      finalPermission = request;
      setPermission(request);
    }

    if (finalPermission.status === "granted") {
      getContacts();
    } else {
      onDenied();
    }
  }, [getContacts, onDenied, permission]);

  const searchContacts = useCallback(
    (text) => {
      const filtered = inMemory.filter((contact) => {
        const lowercase = contact?.name.toLowerCase();
        const searchTerm = text.toString().toLowerCase();
        return lowercase.indexOf(searchTerm) > -1;
      });

      setContacts(filtered);
    },
    [inMemory],
  );

  useEffect(() => {
    Contacts.getPermissionsAsync().then((permission) => {
      setPermission(permission);

      if (permission.granted) {
        getContacts();
      }
    });
  }, [getContacts]);

  return useMemo(
    () => ({
      contacts,
      invites,
      permission,
      requestContacts,
      searchContacts,
    }),
    [contacts, invites, permission, requestContacts, searchContacts],
  );
}
