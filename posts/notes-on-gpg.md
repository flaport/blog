# My notes on GPG and PGP

_GPG_ stands for the 'GNU Privacy Guard'. It's the standard way to manage your _PGP_
keys on Linux. _PGP_, in turn, stands for 'Pretty Good Privacy'. With _PGP_ you
typically create a _public_/_private_ key pair which are respectively used to _encrypt_
and _decrypt_ messages. _PGP_ keys are mostly used to send sensitive information over
the internet or to prove your identity online.

In practice, sending information is done by first sharing your _public_ key with
everyone such that any person can use that key to encrypt the information they want to
send you. On receiving a message encrypted with your own _public_ key,
you can use your _private_ key to _decrypt_ it.

Conversely, if you're in possession of someones public key, you can use that _public_
key to _encrypt_ a message for that person, who can then decrypt it by using his private
key.

Usually, public keys can be _published_ on public key servers to make it easier for
others to find your public key and use it to send you encrypted information. However,
keep in mind that these public keys can never be deleted from a key server.

## Generating keys

To generate a public-private key pair, run the full `gpg` wizard. It's best to choose
the default options wherever possible.

```
$ gpg --full-gen-key
```

You'll be asked a few questions about your identity. Fill them out correctly... as PGP
is used to prove identity it's impossible to change the identity information on
your key later on.

## Exporting keys

First list your secret keys

```
$ gpg --list-secret-keys
```

Copy the id of the key you want to export. The ID is often defined as the _last 8_
(short ID) or _last 16_ (long ID) digits of the key fingerprint shown in the listing. Be
aware that collisions might happen with 8-digit short IDs. Often, you'll only have one
public key per email address, in which case the email address tied to the gpg key can
also be used as key ID.

To export a public key:

```
$ gpg --export --armor --output public.asc <key-id>
```

To export a private key:

```
$ gpg --export-secret-key --armor --output private.asc <key-id>
```

By default, the private key will be exported **and** encrypted with the same password
as you used to generate the key.

If you want to export your private key with a different password (or with no password),
you'll have to edit the key **before exporting**. Editing the password can for example
be done as follows:

```
$ gpg --edit-key <key-id>

Secret key is available.

---

gpg> passwd
```

First, enter the current password, then enter the new password twice (leave blank for no
password). You will also be asked to provide a new password for each of your subkeys.
After setting the new password (or removing the password), type `quit` to exit the
`gpg`-prompt.

You might have noticed the `--armor` flag used in the above export commands. The armor
command is used to export to (or import from) ASCII encoding (in stead of binary). If
you want to import/export to binary format, drop the `--armor` flag. Also in that case,
the convention is to use a `.pgp` extension for the exported key:

```
$ gpg --export --output public.pgp <key-id>
$ gpg --export-secret-key --output private.pgp <key-id>
```

## Publishing keys

To export (publish) your public key to a public key server, use:

```
$ gpg --keyserver <keyserver-uri> --send-key <key-id>
```

For example to publish your key on the ubuntu keyservers, use
`hkp://keyserver.ubuntu.com` as keyserver.

You can check if the key was published correctly by searching for it:

```
$ gpg --keyserver <keyserver-uri> --search <key-id>
```

## Importing keys

Both public and private keys can be imported from an exported key file as follows:

```
$ gpg --import public.asc
$ gpg --import private.asc
```

In case the private key was encrypted with a password, you'll need to provide it.

By default, imported public keys have the lowest trust level ('unknown'). If the
imported keys are indeed your own, you should increase the trust level to the 'ultimate'
level to prevent that some encryption programs refuse to use your own public key for
encryption. This can be done as follows:

```
$ gpg --edit-key <key-id>

gpg> trust

Please decide how far you trust this user to correctly verify other users' keys
(by looking at passports, checking fingerprints from different sources, etc.)

  1 = I don't know or won't say
  2 = I do NOT trust
  3 = I trust marginally
  4 = I trust fully
  5 = I trust ultimately
  m = back to the main menu

Your decision? 5
Do you really want to set this key to ultimate trust? (y/N) y
```

In general, it might also be a good idea to increase the trust level of imported public
keys you _don't_ own to a level you're comfortable with.

## Deleting keys

A public key can be deleted from your keyring as follows:

```
$ gpg --delete-key <key-id>
```

However, this will only work for public keys for which you do not own the private key.
Hence this is usually used to delete the public key of someone _else_ from your system.

To delete a personal public key from your system, you have to delete the private key
first.

However, if that means you will lose the private key forever, please
**make sure to revoke your public key from any public key server**
**before deleting the private key from your system!**

Indeed, revoking the public key will tell others to disregard it such that they
(hopefully) will start using a different public key that belongs to you which
hasn't been revoked (however, nothing is actually stopping them to keep on using the
old, revoked key).

The private key can be deleted from your system as follows:

```
$ gpg --delete-secret-key <key-id>
```

After which you'll be able to remove the public key as shown above. To simultaneously
delete both keys from your system, use:

```
$ gpg --delete-secret-and-public-key <key-id>
```

## Encrypting messages

To encrypt a message, first find the public key-id you want to use to encrypt the
message. As we know, this can be done with `gpg --list-keys`.

```
$ gpg --encrypt --armor --recipient <key-id> <filename>
```

Which will create a new encrypted file called `<filename>.asc` (or `<filename>.pgp` if
the `--armor` flag is removed).

A message from stdin can also be encrypted. For example:

```
$ echo "This message will be encrypted" | gpg --encrypt --armor --recipient <key-id>
```

Note that multiple recipients can be supplied by repeating the `--recipient` flag
multiple times. This will make sure the message can be decrypted by _all_ recipients
specified.

## Decrypting messages

To decrypt a message, you'll need to have at least one of the private keys belonging to
any of the public keys the message was encrypted with. Then the message can simply be
decrypted as:

```
$ gpg --decrypt <filename>
```

Or, for a message coming from stdin:

```
$ echo "This message will be encrypted then decrypted" | gpg --encrypt --armor --recipient <key-id> | gpg --decrypt
```

## My Public GPG key

That's it. Feel free to leave an encrypted comment below. This is my public gpg key:

```
-----BEGIN PGP PUBLIC KEY BLOCK-----

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
YzCKa68OV9Q=
=sCyY
-----END PGP PUBLIC KEY BLOCK-----
```
